package com.streakup.model.dto;

import java.time.LocalDate;

public class HeatmapDayDto {
    private LocalDate date;
    private int count;

    public HeatmapDayDto() {}

    public HeatmapDayDto(LocalDate date, int count) {
        this.date = date;
        this.count = count;
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
}
