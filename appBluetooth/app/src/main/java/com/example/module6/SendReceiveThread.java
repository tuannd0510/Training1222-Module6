package com.example.module6;

import android.bluetooth.BluetoothSocket;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class SendReceiveThread extends Thread{
//
//    private final BluetoothSocket bluetoothSocket;
//    private final InputStream inputStream;
//    private final OutputStream outputStream;
//
//    public SendReceiveThread (BluetoothSocket socket)
//    {
//        bluetoothSocket=socket;
//        InputStream tempIn=null;
//        OutputStream tempOut=null;
//
//        try {
//            tempIn = bluetoothSocket.getInputStream();
//            tempOut = bluetoothSocket.getOutputStream();
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//
//        inputStream=tempIn;
//        outputStream=tempOut;
//    }
//
//    public void run()
//    {
//        byte[] buffer=new byte[1024];
//        int bytes;
//
//        while (true)
//        {
//            try {
//                bytes=inputStream.read(buffer);
//                handler.obtainMessage(STATE_MESSAGE_RECEIVED,bytes,-1,buffer).sendToTarget();
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//        }
//    }
//
//    public void write(byte[] bytes)
//    {
//        try {
//            outputStream.write(bytes);
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }
}
