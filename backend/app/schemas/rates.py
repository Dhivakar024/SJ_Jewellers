from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, model_validator


class MetalRatePublicResponse(BaseModel):
    """Public rate response for a single metal."""
    api_rate: float = Field(..., description="Current rate from external API")
    active_rate: float = Field(..., description="Active operational rate (custom if enabled and valid, else api_rate)")
    mode: str = Field(..., description="Operational mode: 'api' or 'custom'")
    updated_at: Optional[datetime] = None


class RatesPublicResponse(BaseModel):
    """Public rates response for Gold and Silver."""
    gold: MetalRatePublicResponse
    silver: MetalRatePublicResponse


class MetalRateAdminResponse(BaseModel):
    """Admin rate details for a single metal."""
    api_rate: float
    active_rate: float
    custom_rate: Optional[float] = None
    mode: str
    custom_rate_expires_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class RatesAdminResponse(BaseModel):
    """Complete admin rates response for Gold and Silver."""
    gold: MetalRateAdminResponse
    silver: MetalRateAdminResponse


class MetalCustomRateInput(BaseModel):
    """Configuration for setting or disabling custom rate for a metal."""
    enabled: bool = Field(..., description="True to enable custom rate, False to switch to API mode")
    rate: Optional[float] = Field(None, description="Custom rate per gram (required when enabled is True)")

    @model_validator(mode="after")
    def validate_rate_when_enabled(self):
        if self.enabled:
            if self.rate is None or self.rate <= 0:
                raise ValueError("Rate must be a positive number when custom mode is enabled")
        return self


class SetCustomRatesRequest(BaseModel):
    """Admin payload to configure custom rates for gold and/or silver."""
    gold: Optional[MetalCustomRateInput] = None
    silver: Optional[MetalCustomRateInput] = None

    @model_validator(mode="after")
    def validate_at_least_one(self):
        if self.gold is None and self.silver is None:
            raise ValueError("At least one metal (gold or silver) must be specified")
        return self


class MetalRateSummary(BaseModel):
    """Summary of rates for refresh response."""
    api_rate: float
    active_rate: float


class RefreshRatesResponse(BaseModel):
    """Response returned when rates are refreshed."""
    message: str = "Rates refreshed successfully"
    gold: MetalRateSummary
    silver: MetalRateSummary


class RateHistoryItem(BaseModel):
    """History entry for rate changes."""
    id: str
    metal: str
    previous_rate: float
    new_rate: float
    mode: str
    changed_by: Optional[str] = None
    source: str
    changed_at: datetime


class RateHistoryResponse(BaseModel):
    """Response containing list of rate history events."""
    items: List[RateHistoryItem]
    total: int
