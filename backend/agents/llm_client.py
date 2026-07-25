import os
import sys

PROVIDER_API_KEY_ENV_VARS = {
    "anthropic": "ANTHROPIC_API_KEY",
    "openai": "OPENAI_API_KEY",
}


def get_chat_model():
    """Build the LangChain chat model for PackageSelectionAgent from env config.

    Deliberately not called at import time or in any __init__: constructing a
    provider client can fail (missing/invalid API key), and that failure must
    surface as a single agent execution error, not crash app startup.
    """
    provider = os.getenv("LLM_PROVIDER", "anthropic").lower()
    model_name = os.getenv("LLM_MODEL")

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(model=model_name or "claude-sonnet-5", temperature=0)

    if provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model=model_name or "gpt-4o-mini", temperature=0)

    raise ValueError(f"Unsupported LLM_PROVIDER '{provider}'")


def validate_llm_config() -> None:
    """Warn at startup if the configured provider has no API key set.

    Advisory only, never raises: PackageSelectionAgent must still work in
    fallback mode when the LLM isn't configured, so a missing key should not
    prevent the app from starting.
    """
    provider = os.getenv("LLM_PROVIDER", "anthropic").lower()
    key_env_var = PROVIDER_API_KEY_ENV_VARS.get(provider)

    if key_env_var is None:
        print(
            f"[startup warning] LLM_PROVIDER='{provider}' is not a recognized provider "
            f"({', '.join(PROVIDER_API_KEY_ENV_VARS)}). PackageSelectionAgent will use the "
            "deterministic rank-1 fallback until this is fixed.",
            file=sys.stderr,
        )
        return

    if not os.getenv(key_env_var):
        print(
            f"[startup warning] LLM_PROVIDER='{provider}' but {key_env_var} is not set in "
            "backend/.env. PackageSelectionAgent will use the deterministic rank-1 fallback "
            "until a valid key is configured.",
            file=sys.stderr,
        )
