from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    request_timeout_seconds: float
    max_parallel_workers: int
    filter_content_agent_url: str
    ambiguity_agent_url: str
    result_aggregator_url: str
    custom_agents_url: str
    agent_urls: dict[str, str]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings(
        request_timeout_seconds=float(os.getenv("REQUEST_TIMEOUT_SECONDS", "120")),
        max_parallel_workers=int(os.getenv("MAX_PARALLEL_WORKERS", "8")),
        filter_content_agent_url=os.getenv(
            "FILTER_CONTENT_AGENT_URL",
            "http://filter-content-agent:8088/v1/analyze/stream",
        ),
        ambiguity_agent_url=os.getenv(
            "AMBIGUITY_AGENT_URL",
            "http://ambiguilty-resolver-0lvl-agent:8086/v1/analyze/stream",
        ),
        result_aggregator_url=os.getenv(
            "RESULT_AGGREGATOR_URL",
            "http://result-aggregator-agent:8089/v1/aggregate/stream",
        ),
        custom_agents_url=os.getenv(
            "CUSTOM_AGENTS_URL",
            "http://custom-agents-service:8091/v1/execute/stream",
        ),
        agent_urls={
            "financial_crime": os.getenv(
                "FINANCIAL_CRIME_AGENT_URL",
                "http://financial-crime-integrity-agent:8080/v1/analyze/stream",
            ),
            "data_protection": os.getenv(
                "DATA_PROTECTION_AGENT_URL",
                "http://data-protection-agent:8082/v1/analyze/stream",
            ),
            "payments_vulnerability": os.getenv(
                "PAYMENTS_VULNERABILITY_AGENT_URL",
                "http://payments-vulnerability-agent:8083/v1/analyze/stream",
            ),
            "consumer_protection": os.getenv(
                "CONSUMER_PROTECTION_AGENT_URL",
                "http://consumer-protection-agent:8084/v1/analyze/stream",
            ),
            "ai_governance": os.getenv(
                "AI_GOVERNANCE_AGENT_URL",
                "http://ai-governance-analyst-v3-agent:8085/v1/analyze/stream",
            ),
            "crypto_domain": os.getenv(
                "CRYPTO_DOMAIN_AGENT_URL",
                "http://crypto-domain-analyzer-agent:8087/v1/analyze/stream",
            ),
        },
    )
