from enum import Enum


class CaseType(str, Enum):
    CONSUMER_COMPLAINT = "consumer_complaint"
    CIVIL_SUIT = "civil_suit"
    CRIMINAL_FIR = "criminal_fir"
    FAMILY_MATRIMONIAL = "family_matrimonial"
    PROPERTY_DISPUTE = "property_dispute"
    LABOUR_EMPLOYMENT = "labour_employment"
    RTI_APPLICATION = "rti_application"
    OTHER = "other"


class DocumentStrengthStatus(str, Enum):
    STRONG = "strong"
    AVAILABLE = "available"
    MISSING = "missing"
    NOT_MENTIONED = "not_mentioned"


class TriageFlag(str, Enum):
    FAST_TRACK = "fast_track"
    MODERATE = "moderate"
    HIGH_RISK = "high_risk"
