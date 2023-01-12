package com.example.module6.chat;

import static com.example.module6.chat.Flags.*;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;
import android.os.Handler;
import android.os.Message;

import java.io.IOException;
import java.util.UUID;

public class ServerThread extends Thread{

    private BluetoothServerSocket serverSocket;
    private Handler handler;

    public ServerThread(BluetoothAdapter bluetoothAdapter, String APP, UUID myUUID, Handler handler){
        this.handler = handler;
        try {
            serverSocket = bluetoothAdapter.listenUsingRfcommWithServiceRecord(APP, myUUID);
        }catch (IOException e){
            e.printStackTrace();
        }
    }

    @Override
    public void run() {
        BluetoothSocket socket = null;

        while (socket==null)
        {
            try {
                Message message = Message.obtain();
                message.what=STATE_CONNECTING;
                handler.sendMessage(message);

                socket=serverSocket.accept();
            } catch (IOException e) {
                e.printStackTrace();
                Message message=Message.obtain();
                message.what=STATE_CONNECTION_FAILED;
                handler.sendMessage(message);
            }

            if(socket!=null)
            {
                // Do something for send/receive
                Message message=Message.obtain();
                message.what=STATE_CONNECTED;
                handler.sendMessage(message);
                SendReceiveThread sendReceive = new SendReceiveThread(socket, handler);
                sendReceive.start();
                break;
            }
        }
    }
}
