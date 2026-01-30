# 🤝 团队协作规范

## 一、Git 工作流

### 分支策略

```
main (稳定版)
  │
  └── develop (开发主线)
        │
        ├── feature/frontend-xxx   # 前端功能
        ├── feature/backend-xxx    # 后端功能
        └── feature/model-xxx      # 模型功能
```

### 开发流程

1. **创建功能分支**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/frontend-login-page
   ```

2. **开发并提交**
   ```bash
   git add .
   git commit -m "feat(frontend): 添加登录页面UI"
   ```

3. **推送并创建PR**
   ```bash
   git push origin feature/frontend-login-page
   # 在GitHub/Gitee上创建Pull Request
   ```

4. **代码审查后合并到 develop**

### Commit 消息规范

```
<type>(<scope>): <subject>

类型(type):
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 构建/工具

范围(scope):
- frontend
- backend
- model
- docs

示例:
feat(model): 添加任务生成Prompt模板
fix(backend): 修复API超时问题
docs: 更新部署文档
```

## 二、代码审查

### 审查要点

- [ ] 代码是否符合项目规范
- [ ] 是否有明显的bug或性能问题
- [ ] 是否影响其他模块
- [ ] 文档是否同步更新

### 审查分工

| PR类型 | 主要审查者 |
|--------|----------|
| 前端代码 | 后端组 + 产品 |
| 后端代码 | 模型组 |
| 模型代码 | 学长 |

## 三、沟通协作

### 接口约定

前后端接口变更需要：
1. 在 `docs/API_DOCS.md` 中更新文档
2. 提前通知相关同学
3. 保持向后兼容（如有破坏性变更需提前沟通）

### 模型对接

模型组输出需提供：
1. Prompt模板 → `model/prompts/`
2. 调用示例 → README中说明
3. 性能指标 → 评估报告

### 周会同步

- **时间**: 每周一次（具体时间待定）
- **内容**: 各组进度同步、问题讨论、下周计划

## 四、环境配置

### 环境变量

复制 `.env.example` 为 `.env`，配置以下变量：

```bash
# 模型API密钥
DASHSCOPE_API_KEY=your_api_key

# 其他配置...
```

**注意**: `.env` 文件不要提交到Git！

## 五、发布流程

1. `develop` 分支功能测试通过
2. 创建 PR 合并到 `main`
3. 打标签 `git tag v1.0.0`
4. 部署到魔搭平台

---

有问题随时在群里沟通！🚀
