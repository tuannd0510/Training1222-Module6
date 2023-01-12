package com.example.module6.chat;

import java.util.logging.Handler;

public class Holder {
    private int iPosition; // item of list view paired
    private Handler handler;

    public int getiPosition() {
        return iPosition;
    }
    public void setiPosition(int iPosition) {
        this.iPosition = iPosition;
    }

    public Handler getHandler() {
        return handler;
    }
    public void setHandler(Handler handler){
        this.handler = handler;
    }

    public static final Holder holder = new Holder();
    public static Holder getInstance() {return holder;}
}
