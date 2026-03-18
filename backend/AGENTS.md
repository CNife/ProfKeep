# AI Agent 工作指导 - 后端开发

## 项目结构

```
backend/
├── api/                # API路由
├── models/             # 数据模型 (SQLAlchemy)
├── services/           # 业务逻辑
├── schemas/            # Pydantic模型
├── database/           # 数据库配置
├── utils/              # 工具函数
├── config.py           # 配置文件
└── main.py             # 应用入口
```

## 开发规范

### Python代码规范
- **格式化**: ruff format --line-length 100
- **检查**: ruff check --fix
- **类型注解**: 必须使用类型提示
- **文档字符串**: Google风格

### FastAPI规范
- 使用依赖注入 `Depends(get_db)`
- 使用Pydantic模型验证请求/响应
- 统一错误处理: `raise HTTPException`
- API文档自动生成: http://localhost:8000/docs

### SQLAlchemy规范
- 模型继承 `Base`
- 使用 `relationship` 定义关系
- 事务处理使用上下文管理器

### Tushare集成
- 免费版有调用频率限制，需实现缓存
- 错误处理: 捕获 `TushareException`
- API Token 配置在 `config.py`

## 常用命令

```bash
# 开发环境
uvicorn main:app --reload

# 格式化代码
ruff format --line-length 100 .

# 运行测试
pytest
```

---

详细开发规范请参考项目根目录 `AGENTS.md`。