import pytest

from agents.llm_client import get_chat_model, validate_llm_config


def _clear_provider_env(monkeypatch):
    for var in ["LLM_PROVIDER", "LLM_MODEL", "GEMINI_MODEL", "GOOGLE_API_KEY", "ANTHROPIC_API_KEY", "OPENAI_API_KEY"]:
        monkeypatch.delenv(var, raising=False)


def test_defaults_to_gemini_when_provider_unset(monkeypatch):
    _clear_provider_env(monkeypatch)
    monkeypatch.setenv("GOOGLE_API_KEY", "fake-key")

    model = get_chat_model()

    assert type(model).__name__ == "ChatGoogleGenerativeAI"


def test_gemini_missing_api_key_raises_clear_error(monkeypatch):
    _clear_provider_env(monkeypatch)
    monkeypatch.setenv("LLM_PROVIDER", "gemini")

    with pytest.raises(ValueError, match="GOOGLE_API_KEY"):
        get_chat_model()


def test_gemini_respects_gemini_model_override(monkeypatch):
    _clear_provider_env(monkeypatch)
    monkeypatch.setenv("GOOGLE_API_KEY", "fake-key")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-1.5-flash")

    model = get_chat_model()

    assert model.model == "gemini-1.5-flash"


def test_anthropic_still_supported_and_missing_key_raises(monkeypatch):
    _clear_provider_env(monkeypatch)
    monkeypatch.setenv("LLM_PROVIDER", "anthropic")

    with pytest.raises(ValueError, match="ANTHROPIC_API_KEY"):
        get_chat_model()


def test_anthropic_builds_when_key_present(monkeypatch):
    _clear_provider_env(monkeypatch)
    monkeypatch.setenv("LLM_PROVIDER", "anthropic")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "fake-key")

    model = get_chat_model()

    assert type(model).__name__ == "ChatAnthropic"


def test_openai_still_supported_and_missing_key_raises(monkeypatch):
    _clear_provider_env(monkeypatch)
    monkeypatch.setenv("LLM_PROVIDER", "openai")

    with pytest.raises(ValueError, match="OPENAI_API_KEY"):
        get_chat_model()


def test_unsupported_provider_raises_clear_error(monkeypatch):
    _clear_provider_env(monkeypatch)
    monkeypatch.setenv("LLM_PROVIDER", "not-a-real-provider")

    with pytest.raises(ValueError, match="Unsupported LLM_PROVIDER"):
        get_chat_model()


def test_validate_llm_config_warns_when_key_missing(monkeypatch, capsys):
    _clear_provider_env(monkeypatch)
    monkeypatch.setenv("LLM_PROVIDER", "gemini")

    validate_llm_config()

    captured = capsys.readouterr()
    assert "GOOGLE_API_KEY" in captured.err
    assert "gemini" in captured.err


def test_validate_llm_config_silent_when_key_present(monkeypatch, capsys):
    _clear_provider_env(monkeypatch)
    monkeypatch.setenv("LLM_PROVIDER", "gemini")
    monkeypatch.setenv("GOOGLE_API_KEY", "fake-key")

    validate_llm_config()

    captured = capsys.readouterr()
    assert captured.err == ""


def test_validate_llm_config_warns_on_unsupported_provider(monkeypatch, capsys):
    _clear_provider_env(monkeypatch)
    monkeypatch.setenv("LLM_PROVIDER", "not-a-real-provider")

    validate_llm_config()

    captured = capsys.readouterr()
    assert "not a recognized provider" in captured.err
