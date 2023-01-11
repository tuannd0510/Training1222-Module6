package com.example.module6;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;

import java.io.IOException;

public class ClientThread extends Thread{

    private BluetoothDevice device;
    private BluetoothSocket socket;

//    public ClientThread (BluetoothDevice device)
//    {
//        this.device=device;
//
//        try {
//            socket=device.createRfcommSocketToServiceRecord(MY_UUID);
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }
//
//    public void run()
//    {
//        try {
//            socket.connect();
//            Message message=Message.obtain();
//            message.what=STATE_CONNECTED;
//            handler.sendMessage(message);
//
//            sendReceive=new SendReceiveThread(socket);
//            sendReceive.start();
//
//        } catch (IOException e) {
//            e.printStackTrace();
//            Message message=Message.obtain();
//            message.what=STATE_CONNECTION_FAILED;
//            handler.sendMessage(message);
//        }
//    }
}
