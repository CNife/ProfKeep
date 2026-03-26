"""FundService 单元测试。"""

from unittest.mock import MagicMock, patch

import pytest
from sqlmodel import Session

from profkeep.models import Fund, init_db
from profkeep.services.fund import FundService


@pytest.fixture(autouse=True)
def setup_db(tmp_path, monkeypatch):
    """设置临时测试数据库。"""
    from profkeep.models import database

    db_file = tmp_path / "test.db"
    monkeypatch.setattr(database, "DB_PATH", db_file)
    monkeypatch.setattr(database, "engine", database.get_engine())
    init_db()
    yield


@pytest.fixture
def service():
    """创建 FundService 实例。"""
    return FundService()


class TestGetFundInfoCacheHit:
    """测试缓存命中场景。"""

    @pytest.mark.asyncio
    async def test_get_fund_info_cache_hit(self, service):
        """本地缓存命中，不调用 API。"""
        # 先在数据库中创建 Fund 记录
        from profkeep.models.database import engine

        with Session(engine) as session:
            fund = Fund(code="110022", name="易方达消费行业", type="股票型")
            session.add(fund)
            session.commit()
            session.refresh(fund)

        # Mock TushareService 确保它不会被调用
        with patch("profkeep.services.fund.TushareService") as MockTushare:
            mock_instance = MagicMock()
            MockTushare.return_value = mock_instance

            result = await service.get_or_create("110022")

            # 验证返回缓存的 Fund
            assert result.code == "110022"
            assert result.name == "易方达消费行业"
            assert result.type == "股票型"

            # 验证 TushareService 未被调用
            MockTushare.assert_not_called()


class TestGetFundInfoCacheMiss:
    """测试缓存未命中场景。"""

    @pytest.mark.asyncio
    async def test_get_fund_info_cache_miss(self, service):
        """缓存未命中，调用 API 并存储。"""
        from profkeep.models.database import engine

        mock_fund_info = {
            "name": "易方达消费行业",
            "fund_type": "股票型",
            "management": "易方达基金",
        }

        with patch("profkeep.services.fund.TushareService") as MockTushare:
            mock_instance = MagicMock()
            mock_instance.get_fund_info.return_value = mock_fund_info
            MockTushare.return_value = mock_instance

            result = await service.get_or_create("110022")

            # 验证返回正确的 Fund
            assert result.code == "110022"
            assert result.name == "易方达消费行业"
            assert result.type == "股票型"

            # 验证 TushareService 被调用
            MockTushare.assert_called_once()
            mock_instance.get_fund_info.assert_called_once_with("110022")

            # 验证数据已存储到数据库
            with Session(engine) as session:
                stored = session.get(Fund, result.id)
                assert stored is not None
                assert stored.code == "110022"
                assert stored.name == "易方达消费行业"


class TestGetFundInfoInvalidCode:
    """测试无效基金代码处理。"""

    @pytest.mark.asyncio
    async def test_get_fund_info_invalid_code(self, service):
        """无效基金代码处理。"""
        with patch("profkeep.services.fund.TushareService") as MockTushare:
            mock_instance = MagicMock()
            # TushareService.get_fund_info 返回空字典表示未找到
            mock_instance.get_fund_info.return_value = {}
            MockTushare.return_value = mock_instance

            with pytest.raises(ValueError, match="未找到该基金代码"):
                await service.get_or_create("999999")

            # 验证 API 被调用
            mock_instance.get_fund_info.assert_called_once_with("999999")


class TestGetFundInfoNetworkError:
    """测试网络错误处理。"""

    @pytest.mark.asyncio
    async def test_get_fund_info_network_error(self, service):
        """网络错误处理。"""
        with patch("profkeep.services.fund.TushareService") as MockTushare:
            mock_instance = MagicMock()
            mock_instance.get_fund_info.side_effect = Exception("Network connection failed")
            MockTushare.return_value = mock_instance

            with pytest.raises(ValueError, match="网络错误"):
                await service.get_or_create("110022")


class TestCreateFromTushareSuccess:
    """测试从 Tushare 创建成功。"""

    @pytest.mark.asyncio
    async def test_create_from_tushare_success(self, service):
        """API 创建成功。"""
        from profkeep.models.database import engine

        mock_fund_info = {
            "name": "华夏成长",
            "fund_type": "混合型",
            "management": "华夏基金",
        }

        with patch("profkeep.services.fund.TushareService") as MockTushare:
            mock_instance = MagicMock()
            mock_instance.get_fund_info.return_value = mock_fund_info
            MockTushare.return_value = mock_instance

            result = await service.create_from_tushare("000001")

            # 验证返回正确的 Fund
            assert result.code == "000001"
            assert result.name == "华夏成长"
            assert result.type == "混合型"

            # 验证 API 被正确调用
            MockTushare.assert_called_once()
            mock_instance.get_fund_info.assert_called_once_with("000001")

            # 验证数据已存储
            with Session(engine) as session:
                stored = session.get(Fund, result.id)
                assert stored is not None
                assert stored.code == "000001"


class TestCreateFromTushareApiFailure:
    """测试 API 失败处理。"""

    @pytest.mark.asyncio
    async def test_create_from_tushare_api_failure(self, service):
        """API 失败处理 - 未找到基金。"""
        with patch("profkeep.services.fund.TushareService") as MockTushare:
            mock_instance = MagicMock()
            mock_instance.get_fund_info.return_value = {}
            MockTushare.return_value = mock_instance

            with pytest.raises(ValueError, match="未找到该基金代码"):
                await service.create_from_tushare("999999")

    @pytest.mark.asyncio
    async def test_create_from_tushare_timeout(self, service):
        """API 失败处理 - 超时。"""
        with patch("profkeep.services.fund.TushareService") as MockTushare:
            mock_instance = MagicMock()
            mock_instance.get_fund_info.side_effect = TimeoutError("Request timeout")
            MockTushare.return_value = mock_instance

            with pytest.raises(ValueError, match="查询超时"):
                await service.create_from_tushare("110022")

    @pytest.mark.asyncio
    async def test_create_from_tushare_connection_error(self, service):
        """API 失败处理 - 连接错误。"""
        with patch("profkeep.services.fund.TushareService") as MockTushare:
            mock_instance = MagicMock()
            mock_instance.get_fund_info.side_effect = Exception("Connection refused")
            MockTushare.return_value = mock_instance

            with pytest.raises(ValueError, match="网络错误"):
                await service.create_from_tushare("110022")
