#!/usr/bin/env python
# -*- coding: utf-8 -*-

from dashscope import Generation
import dashscope
import json

import os

dashscope.api_key = os.environ.get("DASHSCOPE_API_KEY", "")
if not dashscope.api_key:
    raise RuntimeError("Missing DASHSCOPE_API_KEY env var")

response = Generation.call(
    model='qwen-turbo',
    messages=[{'role': 'user', 'content': 'Hello'}],
    max_tokens=50
)

print(f'Response type: {type(response)}')
print(f'Status code: {response.status_code}')
print(f'Has output: {hasattr(response, "output")}')

# 查看响应对象的所有属性
attrs = [x for x in dir(response) if not x.startswith('_')]
print(f'Public Attributes: {attrs}')

# 尝试转换为 JSON 查看
if hasattr(response, '__dict__'):
    print(f'\nResponse dict:')
    print(json.dumps(response.__dict__, indent=2, ensure_ascii=False, default=str))

# 查看响应中的关键信息
if hasattr(response, 'output'):
    print(f'\nOutput: {response.output}')
    print(f'Output type: {type(response.output)}')
    
    if response.output is not None:
        # 尝试不同的方式访问内容
        if hasattr(response.output, 'choices'):
            print(f'Has choices attribute: {hasattr(response.output, "choices")}')
            print(f'Choices: {response.output.choices}')
            if response.output.choices:
                print(f'First choice: {response.output.choices[0]}')
                choice = response.output.choices[0]
                print(f'Choice type: {type(choice)}')
                print(f'Choice dir: {[x for x in dir(choice) if not x.startswith("_")]}')
