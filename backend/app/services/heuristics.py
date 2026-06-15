from collections import Counter

SPAM_WORDS = {"free", "offer", "buy now", "winner", "discount", "urgent", "click"}
POSITIVE_WORDS = {"great", "good", "excellent", "love", "happy", "amazing"}
NEGATIVE_WORDS = {"bad", "hate", "terrible", "angry", "poor", "awful"}


def simple_predict(text: str, label_names: list[str]) -> tuple[str | None, str | None]:
    lowered = text.lower()
    if {"spam", "not spam"}.issubset({name.lower() for name in label_names}):
        score = sum(1 for word in SPAM_WORDS if word in lowered)
        return ("Spam" if score >= 1 else "Not Spam", f"{min(0.55 + score * 0.1, 0.95):.2f}")

    sentiment_labels = {name.lower() for name in label_names}
    if {"positive", "negative"}.issubset(sentiment_labels):
        counts = Counter()
        counts["Positive"] = sum(1 for word in POSITIVE_WORDS if word in lowered)
        counts["Negative"] = sum(1 for word in NEGATIVE_WORDS if word in lowered)
        if counts["Positive"] == counts["Negative"] == 0:
            return (None, None)
        label, count = counts.most_common(1)[0]
        return label, f"{min(0.5 + count * 0.12, 0.92):.2f}"

    for label_name in label_names:
        if label_name.lower() in lowered:
            return label_name, "0.70"

    return (label_names[0] if label_names else None, "0.50" if label_names else None)
