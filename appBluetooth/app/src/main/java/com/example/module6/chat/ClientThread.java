package com.example.module6.chat;

import static com.example.module6.chat.Flags.*;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.os.Handler;
import android.os.Message;

import java.io.IOException;
import java.util.UUID;

public class ClientThread extends Thread{

    private BluetoothDevice device;
    private BluetoothSocket socket;
    private Handler handler;

    public ClientThread (BluetoothDevice device, UUID myUUID, Handler handler)
    {
        this.device = device;
        this.handler = handler;
        try {
            socket = device.createRfcommSocketToServiceRecord(myUUID);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void run()
    {
        try {
            socket.connect();
            Message message=Message.obtain();
            message.what=STATE_CONNECTED;
            handler.sendMessage(message);

            SendReceiveThread sendReceive = new SendReceiveThread(socket, handler);
            sendReceive.start();

        } catch (IOException e) {
            e.printStackTrace();
            Message message=Message.obtain();
            message.what=STATE_CONNECTION_FAILED;
            handler.sendMessage(message);
        }
    }
}
