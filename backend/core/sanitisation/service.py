from __future__ import annotations


class SanitisationService:
    def sanitise(self, text: str) -> tuple[str, list[dict]]:
        log = []
        result = text

        # PII masking with presidio if available
        try:
            from presidio_analyzer import AnalyzerEngine
            from presidio_anonymizer import AnonymizerEngine
            analyzer = AnalyzerEngine()
            anonymizer = AnonymizerEngine()
            findings = analyzer.analyze(text=result, language="en")
            if findings:
                result = anonymizer.anonymize(text=result, analyzer_results=findings).text
                log.append({"type": "pii", "count": len(findings)})
        except ImportError:
            pass
        except Exception as e:
            log.append({"type": "pii_error", "detail": str(e)})

        # Salary detection
        import re
        salary_patterns = [
            r"₹\s*[\d,]+(\.\d+)?", r"Rs\.?\s*[\d,]+(\.\d+)?",
            r"INR\s*[\d,]+", r"\d+(\.\d+)?\s*LPA",
        ]
        for pat in salary_patterns:
            matches = re.findall(pat, result, re.IGNORECASE)
            if matches:
                result = re.sub(pat, "[SALARY_REDACTED]", result, flags=re.IGNORECASE)
                log.append({"type": "salary", "count": len(matches)})

        return result, log
