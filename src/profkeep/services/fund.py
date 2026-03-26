"""基金服务模块。

提供基金信息的查询和缓存功能。
"""

import asyncio

from sqlmodel import Session, select

from profkeep.models import database
from profkeep.models.fund import Fund
from profkeep.services.tushare import TushareService


class FundService:
    """基金服务类。

    提供基金信息的查询、缓存和创建功能。
    实现缓存优先策略：本地数据库 → Tushare API → 本地数据库。
    """

    async def get_or_create(self, code: str) -> Fund:
        """获取或创建基金信息。

        缓存优先策略：先查询本地数据库，不存在则从 Tushare API 获取并存储。

        Args:
            code: 基金代码（6位数字）。

        Returns:
            Fund: 基金对象。

        Raises:
            ValueError: 基金代码无效或网络错误。
        """
        fund = await self.get_by_code(code)
        if fund:
            return fund

        return await self.create_from_tushare(code)

    async def get_by_code(self, code: str) -> Fund | None:
        """从本地数据库查询基金。

        Args:
            code: 基金代码（6位数字）。

        Returns:
            Fund | None: 基金对象，不存在时返回 None。
        """
        with Session(database.engine) as session:
            fund = session.exec(select(Fund).where(Fund.code == code)).first()
            return fund

    async def create_from_tushare(self, code: str) -> Fund:
        """从 Tushare API 获取并创建基金记录。

        Args:
            code: 基金代码（6位数字）。

        Returns:
            Fund: 创建的基金对象。

        Raises:
            ValueError: 未找到该基金代码、网络错误或查询超时。
        """
        try:
            # 使用 run_in_executor 包装同步 API 调用
            loop = asyncio.get_event_loop()
            tushare = TushareService()
            fund_info = await loop.run_in_executor(None, tushare.get_fund_info, code)
        except TimeoutError:
            raise ValueError("查询超时，请重试") from None
        except Exception as e:
            error_msg = str(e).lower()
            if "network" in error_msg or "connection" in error_msg:
                raise ValueError("网络错误，请重试") from None
            raise

        if not fund_info:
            raise ValueError("未找到该基金代码")

        # 创建 Fund 对象
        fund_data = {
            "code": code,
            "name": fund_info.get("name", ""),
            "type": fund_info.get("fund_type"),
        }

        with Session(database.engine) as session:
            fund = Fund.model_validate(fund_data)
            session.add(fund)
            session.commit()
            session.refresh(fund)
            return fund
