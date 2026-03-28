"""交易记录服务模块。"""

from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from profkeep.models import database
from profkeep.models.transaction import Transaction, TransactionType
from profkeep.services.holding import HoldingService


class TransactionService:
    """交易记录服务类。"""

    def create_transaction(
        self,
        account_id: int,
        fund_id: int,
        type: TransactionType,
        date: date,
        shares: Decimal | None = None,
        amount: Decimal | None = None,
        fee: Decimal = Decimal("0"),
        net_value: Decimal | None = None,
        notes: str | None = None,
        confirmed: bool = True,
    ) -> Transaction:
        """创建交易记录。

        Args:
            account_id: 账户 ID。
            fund_id: 基金 ID。
            type: 交易类型。
            date: 交易日期。
            shares: 交易份额。
            amount: 交易金额。
            fee: 手续费。
            net_value: 净值。
            notes: 备注。
            confirmed: 是否已确认。

        Returns:
            创建的交易对象。

        Raises:
            ValueError: 验证失败。
        """
        with Session(database.engine) as session:
            tx_data = {
                "account_id": account_id,
                "fund_id": fund_id,
                "type": type,
                "date": date,
                "shares": shares,
                "amount": amount,
                "fee": fee,
                "net_value": net_value,
                "notes": notes,
                "confirmed": confirmed,
            }
            tx = Transaction.model_validate(tx_data)
            session.add(tx)
            session.commit()
            session.refresh(tx)

        if confirmed:
            HoldingService().recalculate_from_transactions(account_id, fund_id)

        return tx

    def get_transaction(self, transaction_id: int) -> Transaction:
        """获取单个交易。

        Args:
            transaction_id: 交易 ID。

        Returns:
            交易对象。

        Raises:
            ValueError: 交易不存在。
        """
        with Session(database.engine) as session:
            tx = session.exec(
                select(Transaction)
                .where(Transaction.id == transaction_id)
                .options(selectinload(Transaction.fund))
            ).first()
            if not tx:
                raise ValueError("交易不存在")
            return tx

    def list_transactions(self, account_id: int) -> list[Transaction]:
        """列出账户下的所有交易。

        Args:
            account_id: 账户 ID。

        Returns:
            交易列表，按日期倒序排列。
        """
        with Session(database.engine) as session:
            return session.exec(
                select(Transaction)
                .where(Transaction.account_id == account_id)
                .options(selectinload(Transaction.fund))
                .order_by(col(Transaction.date).desc())
            ).all()

    def update_transaction(self, transaction_id: int, **kwargs) -> Transaction:
        """更新交易记录。

        Args:
            transaction_id: 交易 ID。
            **kwargs: 要更新的字段。

        Returns:
            更新后的交易对象。

        Raises:
            ValueError: 交易不存在或验证失败。
        """
        with Session(database.engine) as session:
            tx = session.get(Transaction, transaction_id)
            if not tx:
                raise ValueError("交易不存在")

            old_account_id = tx.account_id
            old_fund_id = tx.fund_id

            # 更新字段
            for key, value in kwargs.items():
                if hasattr(tx, key):
                    setattr(tx, key, value)

            # 触发模型验证（不替换对象，仅验证）
            validated = Transaction.model_validate(tx.model_dump())

            # 将验证后的值同步回原对象
            for key, value in validated.model_dump().items():
                setattr(tx, key, value)

            session.add(tx)
            session.commit()
            session.refresh(tx)

            new_account_id = tx.account_id
            new_fund_id = tx.fund_id

        if tx.confirmed:
            holding_service = HoldingService()
            holding_service.recalculate_from_transactions(new_account_id, new_fund_id)
            if old_account_id != new_account_id or old_fund_id != new_fund_id:
                holding_service.recalculate_from_transactions(old_account_id, old_fund_id)

        return tx

    def delete_transaction(self, transaction_id: int) -> None:
        """删除交易记录。

        Args:
            transaction_id: 交易 ID。

        Raises:
            ValueError: 交易不存在。
        """
        with Session(database.engine) as session:
            tx = session.get(Transaction, transaction_id)
            if not tx:
                raise ValueError("交易不存在")

            account_id = tx.account_id
            fund_id = tx.fund_id
            confirmed = tx.confirmed

            session.delete(tx)
            session.commit()

        if confirmed:
            HoldingService().recalculate_from_transactions(account_id, fund_id)

    def auto_confirm_transactions(self, account_id: int) -> int:
        """自动确认 T+1 交易。

        Args:
            account_id: 账户 ID。

        Returns:
            确认的交易数量。
        """
        threshold_date = date.today() - timedelta(days=1)
        affected_fund_ids: set[int] = set()

        with Session(database.engine) as session:
            pending_txs = session.exec(
                select(Transaction).where(
                    Transaction.account_id == account_id,
                    Transaction.confirmed.is_(False),
                    Transaction.date <= threshold_date,
                )
            ).all()

            for tx in pending_txs:
                tx.confirmed = True
                session.add(tx)
                affected_fund_ids.add(tx.fund_id)

            session.commit()

        holding_service = HoldingService()
        for fund_id in affected_fund_ids:
            holding_service.recalculate_from_transactions(account_id, fund_id)

        return len(pending_txs)
