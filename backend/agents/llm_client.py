import os
import sys

DEFAULT_PROVIDER = "gemini"

PROVIDER_API_KEY_ENV_VARS = {
    "gemini": "GOOGLE_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY",
    "openai": "OPENAI_API_KEY",
}


def get_chat_model():
    """Build the LangChain chat model for PackageSelectionAgent from env config.

    Deliberately not called at import time or in any __init__: constructing a
    provider client can fail (missing/invalid API key), and that failure must
    surface as a single agent execution error, not crash app startup.
    """
    provider = os.getenv("LLM_PROVIDER", DEFAULT_PROVIDER).lower()
    model_name = os.getenv("LLM_MODEL")

    key_env_var = PROVIDER_API_KEY_ENV_VARS.get(provider)
    if key_env_var is None:
        raise ValueError(f"Unsupported LLM_PROVIDER '{provider}'")
    if not os.getenv(key_env_var):
        raise ValueError(
            f"{key_env_var} is not set. Add it to backend/.env to use LLM_PROVIDER='{provider}'."
        )

    if provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        # gemini-2.5-flash was deprecated for new API keys; gemini-3.5-flash
        # is the current GA (non-preview) flash-tier model with free-tier
        # quota and structured-output support as of this writing. Override
        # via GEMINI_MODEL if this drifts again.
        return ChatGoogleGenerativeAI(
            model=os.getenv("GEMINI_MODEL") or model_name or "gemini-3.5-flash", temperature=0
        )

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
    provider = os.getenv("LLM_PROVIDER", DEFAULT_PROVIDER).lower()
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
