package com.example.module6;

public class Holder {
    private int iPosition; // item of list view paired

    public int getiPosition() {
        return iPosition;
    }

    public void setiPosition(int iPosition) {
        this.iPosition = iPosition;
    }

    public static final Holder holder = new Holder();
    public static Holder getInstance() {return holder;}
}
