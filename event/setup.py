from setuptools import setup, find_packages

setup(
    name="event-tools",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "certifi==2021.10.8",
        "charset-normalizer==2.0.12",
        "colorama==0.4.4",
        "configobj==5.0.6",
        "idna==3.3",
        "jsonpath==0.82",
        "loguru==0.6.0",
        "pathlib==1.0.1",
        "python-dotenv==0.21.0",
        "requests==2.27.1",
        "requests_cache==1.1.0",
        "urllib3==1.26.9",
        "win32-setctime==1.1.0",
    ],
    python_requires=">=3.6",
    description="活动文案和礼物配置管理工具",
    author="atian",
    author_email="atian@example.com",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
) 