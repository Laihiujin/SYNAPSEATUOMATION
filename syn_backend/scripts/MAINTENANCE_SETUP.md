# 账号健康维护 - 定时任务配置指南

## 功能说明

`daily_maintenance.py` 脚本会：
1. 自动登录所有账号的创作者平台
2. 停留 60 秒，模拟真人浏览
3. 智能识别并点击各种引导弹窗（"我知道了"、"下一步"等）
4. 更新账号状态到数据库

## 配置定时任务

### macOS / Linux (使用 crontab)

1. 打开终端，编辑 crontab：
```bash
crontab -e
```

2. 添加以下行（每天凌晨 2 点执行）：
```bash
0 2 * * * cd /Users/laihiujin/CC/SynapseAutomation/syn_backend && /usr/bin/python3 scripts/daily_maintenance.py >> logs/maintenance.log 2>&1
```

3. 保存并退出（vim: 按 `ESC` 然后输入 `:wq`）

4. 验证配置：
```bash
crontab -l
```

### Windows (使用任务计划程序)

1. 打开"任务计划程序" (Task Scheduler)

2. 点击"创建基本任务"

3. 配置如下：
   - **名称**: SynapseAutomation 账号维护
   - **触发器**: 每天
   - **时间**: 02:00
   - **操作**: 启动程序
   - **程序/脚本**: `python`
   - **参数**: `scripts/daily_maintenance.py`
   - **起始于**: `C:\path\to\SynapseAutomation\syn_backend`

## 手动运行测试

在配置定时任务前，建议先手动测试：

```bash
cd /Users/laihiujin/CC/SynapseAutomation/syn_backend
python scripts/daily_maintenance.py
```

## 日志查看

日志会保存在 `logs/maintenance.log`：

```bash
tail -f logs/maintenance.log
```

## 调整维护时长

如果需要修改停留时间（默认 60 秒），编辑 `myUtils/maintenance.py`：

```python
# 第 18 行附近
async def dismiss_guides(page: Page, duration: int = 60):  # 修改这里的 60
```

## 添加新的引导关键词

如果发现新的引导弹窗，编辑 `myUtils/maintenance.py`：

```python
# 第 6-10 行
GUIDE_KEYWORDS = [
    r"我知道了", r"好的", r"下一步", 
    # 在这里添加新的关键词
    r"新关键词",
]
```

## 注意事项

1. **首次运行**: 建议在非高峰时段（如凌晨）运行，避免影响正常使用
2. **网络要求**: 确保服务器/电脑在定时任务执行时有网络连接
3. **资源占用**: 每个账号维护约需 1-2 分钟，多账号会累加
4. **Headless 模式**: 默认使用无头浏览器，不会弹出窗口
