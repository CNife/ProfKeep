"""持仓服务模块。

提供持仓的查询、计算和管理功能。
"""

from dataclasses import dataclass
from decimal import Decimal

from sqlmodel import Session, col, select

from profkeep.models import database
from profkeep.models.fund import Fund
from profkeep.models.holding import Holding
from profkeep.models.nav_history import FundNavHistory


@dataclass
class HoldingSummary:
    """持仓汇总信息。

    Attributes:
        holding: 持仓对象。
        fund: 基金对象。
        latest_nav: 最新净值，无净值数据时为 None。
        market_value: 持仓市值，无净值数据时为 None。
        profit: 持仓收益，无净值数据时为 None。
        profit_rate: 收益率百分比，无净值数据时为 None。
    """

    holding: Holding
    fund: Fund
    latest_nav: Decimal | None
    market_value: Decimal | None
    profit: Decimal | None
    profit_rate: Decimal | None


@dataclass
class AccountSummary:
    """账户汇总信息。

    Attributes:
        total_cost: 总成本。
        total_market_value: 总市值，无净值数据时为 None。
        total_profit: 总收益，无净值数据时为 None。
        total_profit_rate: 总收益率百分比，无净值数据时为 None。
    """

    total_cost: Decimal
    total_market_value: Decimal | None
    total_profit: Decimal | None
    total_profit_rate: Decimal | None


class HoldingService:
    """持仓服务类。

    提供持仓的查询、计算和管理功能。
    """

    def get_holdings_by_account(self, account_id: int) -> list[HoldingSummary]:
        """获取账户下的所有持仓及收益计算。

        Args:
            account_id: 账户 ID。

        Returns:
            持仓汇总列表，包含基金信息、最新净值和收益计算。
        """
        with Session(database.engine) as session:
            holdings = session.exec(select(Holding).where(Holding.account_id == account_id)).all()

            if not holdings:
                return []

            fund_ids = [h.fund_id for h in holdings]
            funds = session.exec(select(Fund).where(col(Fund.id).in_(fund_ids))).all()
            fund_map = {f.id: f for f in funds}

            result = []
            for holding in holdings:
                fund = fund_map.get(holding.fund_id)
                if not fund:
                    continue

                latest_nav = self._get_latest_nav(session, holding.fund_id)

                market_value = None
                profit = None
                profit_rate = None

                if latest_nav is not None:
                    market_value = holding.shares * latest_nav
                    cost = holding.shares * holding.cost_price
                    profit = market_value - cost
                    if cost > 0:
                        profit_rate = (profit / cost) * Decimal("100")

                result.append(
                    HoldingSummary(
                        holding=holding,
                        fund=fund,
                        latest_nav=latest_nav,
                        market_value=market_value,
                        profit=profit,
                        profit_rate=profit_rate,
                    )
                )

            return result

    def get_account_summary(self, account_id: int) -> AccountSummary:
        """获取账户汇总信息。

        Args:
            account_id: 账户 ID。

        Returns:
            账户汇总信息，包含总成本、总市值、总收益和总收益率。
        """
        holdings = self.get_holdings_by_account(account_id)

        if not holdings:
            return AccountSummary(
                total_cost=Decimal("0"),
                total_market_value=None,
                total_profit=None,
                total_profit_rate=None,
            )

        total_cost = Decimal("0")
        for h in holdings:
            total_cost += h.holding.shares * h.holding.cost_price

        total_market_value = Decimal("0")
        for h in holdings:
            if h.market_value is not None:
                total_market_value += h.market_value

        if total_market_value > 0:
            total_profit = total_market_value - total_cost
            if total_cost > 0:
                total_profit_rate = (total_profit / total_cost) * Decimal("100")
            else:
                total_profit_rate = None
        else:
            total_profit = None
            total_profit_rate = None

        return AccountSummary(
            total_cost=total_cost,
            total_market_value=total_market_value,
            total_profit=total_profit,
            total_profit_rate=total_profit_rate,
        )

    def get_holding(self, holding_id: int) -> Holding | None:
        """获取单个持仓。

        Args:
            holding_id: 持仓 ID。

        Returns:
            持仓对象，不存在时返回 None。
        """
        with Session(database.engine) as session:
            return session.exec(select(Holding).where(Holding.id == holding_id)).first()

    def create_holding(
        self, account_id: int, fund_id: int, shares: Decimal, cost_price: Decimal
    ) -> Holding:
        """创建持仓。

        Args:
            account_id: 账户 ID。
            fund_id: 基金 ID。
            shares: 持仓份额。
            cost_price: 成本价。

        Returns:
            创建的持仓对象。

        Raises:
            ValueError: 持仓已存在。
        """
        with Session(database.engine) as session:
            existing = session.exec(
                select(Holding).where(Holding.account_id == account_id, Holding.fund_id == fund_id)
            ).first()

            if existing:
                raise ValueError("该基金持仓已存在，请使用编辑功能")

            holding = Holding(
                account_id=account_id,
                fund_id=fund_id,
                shares=shares,
                cost_price=cost_price,
            )
            session.add(holding)
            session.commit()
            session.refresh(holding)
            return holding

    def update_holding(
        self,
        holding_id: int,
        shares: Decimal | None = None,
        cost_price: Decimal | None = None,
    ) -> Holding:
        """更新持仓。

        Args:
            holding_id: 持仓 ID。
            shares: 新的持仓份额，None 表示不更新。
            cost_price: 新的成本价，None 表示不更新。

        Returns:
            更新后的持仓对象。

        Raises:
            ValueError: 持仓不存在。
        """
        with Session(database.engine) as session:
            holding = session.exec(select(Holding).where(Holding.id == holding_id)).first()

            if not holding:
                raise ValueError("持仓不存在")

            if shares is not None:
                holding.shares = shares
            if cost_price is not None:
                holding.cost_price = cost_price

            session.add(holding)
            session.commit()
            session.refresh(holding)
            return holding

    def delete_holding(self, holding_id: int) -> None:
        """删除持仓。

        Args:
            holding_id: 持仓 ID。

        Raises:
            ValueError: 持仓不存在。
        """
        with Session(database.engine) as session:
            holding = session.exec(select(Holding).where(Holding.id == holding_id)).first()

            if not holding:
                raise ValueError("持仓不存在")

            session.delete(holding)
            session.commit()

    def _get_latest_nav(self, session: Session, fund_id: int) -> Decimal | None:
        """获取基金最新净值。

        Args:
            session: 数据库会话。
            fund_id: 基金 ID。

        Returns:
            最新净值，无净值数据时返回 None。
        """
        nav_record = session.exec(
            select(FundNavHistory)
            .where(FundNavHistory.fund_id == fund_id)
            .order_by(col(FundNavHistory.date).desc())
        ).first()

        return nav_record.nav if nav_record else None
