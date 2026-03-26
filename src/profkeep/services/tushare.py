"""Tushare 数据服务模块。

提供基金管理所需的 Tushare 数据接口封装。
"""

import time
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from pathlib import Path

import tushare as ts
from sqlmodel import Session, col, select

from profkeep.models.database import engine
from profkeep.models.fund import Fund
from profkeep.models.holding import Holding
from profkeep.models.nav_history import FundNavHistory, IndexNavHistory
from profkeep.models.transaction import Transaction


@dataclass
class RefreshResult:
    """批量刷新结果。

    Attributes:
        success: 成功刷新的基金代码列表。
        failed: 刷新失败的列表，每项为 (基金代码, 错误原因) 元组。
    """

    success: list[str]
    failed: list[tuple[str, str]]


class TushareService:
    """Tushare 数据服务类。

    封装 Tushare Pro API 调用，提供基金数据访问接口。

    Attributes:
        pro: Tushare Pro API 实例。
    """

    def __init__(self) -> None:
        """初始化 Tushare 服务。

        从 ~/.profkeep/.tushare.key 文件加载 token 并初始化 Pro API。

        Raises:
            FileNotFoundError: 当 token 文件不存在时抛出，错误信息包含
                "Tushare token not found"。
        """
        token_path = Path.home() / ".profkeep" / ".tushare.key"

        if not token_path.exists():
            raise FileNotFoundError("Tushare token not found")

        token = token_path.read_text().strip()
        self.pro = ts.pro_api(token=token)

    def get_fund_info(self, fund_code: str) -> dict:
        """获取基金基本信息。

        Args:
            fund_code: 基金代码（如 '000001'）。

        Returns:
            基金信息字典，包含 name、fund_type、management 等字段。
            基金不存在时返回空字典。
        """
        ts_code = f"{fund_code}.OF"
        df = self.pro.fund_basic(ts_code=ts_code)

        if df is None or df.empty:
            return {}

        row = df.iloc[0]
        return {
            "name": row.get("name"),
            "fund_type": row.get("fund_type"),
            "management": row.get("management"),
        }

    def get_fund_nav(self, fund_code: str, start_date: str | None = None) -> list[FundNavHistory]:
        """获取基金净值历史数据。

        Args:
            fund_code: 基金代码（如 '000001'）。
            start_date: 起始日期，格式 'YYYYMMDD'，None 表示获取全部。

        Returns:
            净值记录列表。fund_id 为占位符 0，存储时需更新。
        """
        ts_code = f"{fund_code}.OF"
        max_retries = 3
        df = None

        for attempt in range(max_retries):
            try:
                df = self.pro.fund_nav(ts_code=ts_code, start_date=start_date)
                break
            except Exception as e:
                error_msg = str(e).lower()
                if attempt == max_retries - 1:
                    raise
                if "network" in error_msg or "timeout" in error_msg or "connection" in error_msg:
                    time.sleep(1 * (attempt + 1))
                    continue
                raise

        if df is None or df.empty:
            return []

        result = []
        for _, row in df.iterrows():
            date_str = row.get("ann_date")
            if not date_str:
                continue
            nav_date = datetime.strptime(str(date_str), "%Y%m%d").date()

            unit_nav = row.get("unit_nav")
            accum_nav = row.get("accum_nav")

            if unit_nav is None:
                continue

            nav = Decimal(str(unit_nav))
            acc_nav = Decimal(str(accum_nav)) if accum_nav is not None else None

            nav_history = FundNavHistory(
                date=nav_date,
                nav=nav,
                acc_nav=acc_nav,
                fund_id=0,
            )
            result.append(nav_history)

        return result

    def get_index_daily(
        self, index_code: str, start_date: str, end_date: str
    ) -> list[IndexNavHistory]:
        """获取指数日线数据。

        Args:
            index_code: 指数代码，格式如 '000300.SH'。
            start_date: 起始日期，格式 'YYYYMMDD'。
            end_date: 结束日期，格式 'YYYYMMDD'。

        Returns:
            指数日线记录列表，按日期降序排列。
        """
        max_retries = 3
        df = None

        for attempt in range(max_retries):
            try:
                df = self.pro.index_daily(
                    ts_code=index_code, start_date=start_date, end_date=end_date
                )
                break
            except Exception as e:
                error_msg = str(e).lower()
                if attempt == max_retries - 1:
                    raise
                if "network" in error_msg or "timeout" in error_msg or "connection" in error_msg:
                    time.sleep(1 * (attempt + 1))
                    continue
                raise

        if df is None or df.empty:
            return []

        result = []
        for _, row in df.iterrows():
            date_str = row.get("trade_date")
            if not date_str:
                continue
            nav_date = datetime.strptime(str(date_str), "%Y%m%d").date()

            close = row.get("close")
            if close is None:
                continue

            close_decimal = Decimal(str(close))

            index_history = IndexNavHistory(
                code=index_code,
                date=nav_date,
                close=close_decimal,
            )
            result.append(index_history)

        return result

    def _save_nav_to_db(self, nav_records: list[FundNavHistory], fund_id: int) -> int:
        """存储净值数据到数据库。

        Args:
            nav_records: 净值记录列表，fund_id 需要更新。
            fund_id: 基金 ID。

        Returns:
            存储的记录数量。
        """
        if not nav_records:
            return 0

        with Session(engine) as session:
            for record in nav_records:
                record.fund_id = fund_id
                existing = session.exec(
                    select(FundNavHistory).where(
                        FundNavHistory.fund_id == fund_id, FundNavHistory.date == record.date
                    )
                ).first()
                if existing:
                    existing.nav = record.nav
                    existing.acc_nav = record.acc_nav
                else:
                    session.add(record)
            session.commit()

        return len(nav_records)

    def refresh_fund_nav(self, fund_code: str) -> int:
        """刷新单只基金的净值数据。

        智能增量获取：查询该基金的首笔交易日期作为起始日期。

        Args:
            fund_code: 基金代码（如 '000001'）。

        Returns:
            存储的净值记录数量。
        """
        with Session(engine) as session:
            fund = session.exec(select(Fund).where(Fund.code == fund_code)).first()
            if not fund or not fund.id:
                raise ValueError(f"基金 {fund_code} 不存在")

            fund_id = fund.id
            first_tx = session.exec(
                select(Transaction)
                .where(Transaction.fund_id == fund_id)
                .order_by(col(Transaction.date))
            ).first()

            start_date = first_tx.date.strftime("%Y%m%d") if first_tx else "20100101"

        nav_records = self.get_fund_nav(fund_code, start_date)
        return self._save_nav_to_db(nav_records, fund_id)

    def refresh_account_navs(self, account_id: int) -> RefreshResult:
        """批量刷新账户下所有基金的净值数据。

        Args:
            account_id: 账户 ID。

        Returns:
            RefreshResult 包含成功和失败的基金列表。
        """
        with Session(engine) as session:
            holdings = session.exec(select(Holding).where(Holding.account_id == account_id)).all()

            fund_ids = [h.fund_id for h in holdings]
            if not fund_ids:
                return RefreshResult(success=[], failed=[])

            funds = session.exec(select(Fund).where(col(Fund.id).in_(fund_ids))).all()
            fund_code_map = {f.id: f.code for f in funds}

        success: list[str] = []
        failed: list[tuple[str, str]] = []

        for fund_id in fund_ids:
            fund_code = fund_code_map.get(fund_id)
            if not fund_code:
                failed.append((str(fund_id), "基金代码不存在"))
                continue

            try:
                self.refresh_fund_nav(fund_code)
                success.append(fund_code)
            except Exception as e:
                failed.append((fund_code, str(e)))

        return RefreshResult(success=success, failed=failed)
