"""One-off test: fetch a few headlines from Finnhub and ask Claude Haiku
for a 1-2 sentence summary. Prints the result; raises on any failure so
the GitHub Actions run fails loudly if either key is bad.

Reads ANTHROPIC_API_KEY and FINNHUB_API_KEY from the environment.
"""

import os
import sys

import requests
from anthropic import Anthropic


def fetch_headlines(limit: int = 5) -> list[str]:
    finnhub_key = os.environ["FINNHUB_API_KEY"]
    resp = requests.get(
        "https://finnhub.io/api/v1/news",
        params={"category": "general", "token": finnhub_key},
        timeout=15,
    )
    resp.raise_for_status()
    articles = resp.json()
    if not articles:
        raise RuntimeError("Finnhub returned no articles - check the key/quota.")
    return [a["headline"] for a in articles[:limit] if a.get("headline")]


def summarize(headlines: list[str]) -> str:
    client = Anthropic()  # reads ANTHROPIC_API_KEY from env
    prompt = "Today's top headlines:\n" + "\n".join(f"- {h}" for h in headlines)
    prompt += "\n\nSummarize the overall market/news mood in 1-2 sentences."
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}],
    )
    return next(b.text for b in response.content if b.type == "text")


def main() -> None:
    print("Fetching headlines from Finnhub...")
    headlines = fetch_headlines()
    for h in headlines:
        print(f"  - {h}")

    print("\nAsking Claude Haiku for a summary...")
    summary = summarize(headlines)
    print(f"\nSummary:\n{summary}")

    print("\nBoth keys work.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001 - surface any failure clearly in CI logs
        print(f"\nTest failed: {exc}", file=sys.stderr)
        sys.exit(1)
