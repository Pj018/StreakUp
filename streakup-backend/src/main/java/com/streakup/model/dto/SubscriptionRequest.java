package com.streakup.model.dto;

import com.streakup.model.enums.PlanType;
import jakarta.validation.constraints.NotNull;

public class SubscriptionRequest {
    @NotNull(message = "Plan type is required")
    private PlanType planType;

    private String transactionId;

    public SubscriptionRequest() {}

    public PlanType getPlanType() { return planType; }
    public void setPlanType(PlanType planType) { this.planType = planType; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
}
