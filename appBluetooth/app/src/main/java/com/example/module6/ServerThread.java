package com.example.module6;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;

import java.io.IOException;
import java.util.UUID;

public class ServerThread extends Thread{

//    private BluetoothServerSocket serverSocket;
//    private static final String APP = "MYAPP";
//
//    private static final UUID myUUID =
//            UUID.fromString("8ce255c0-200a-11e0-ac64-0800200c9a66");
//
//
//    public ServerThread(BluetoothAdapter bluetoothAdapter){
//        try {
//            serverSocket = bluetoothAdapter.listenUsingRfcommWithServiceRecord(APP, myUUID);
//        }catch (IOException e){
//            e.printStackTrace();
//        }
//    }
//
//    @Override
//    public void run() {
//        BluetoothSocket socket=null;
//
//        while (socket==null)
//        {
//            try {
//                Message message=Message.obtain();
//                message.what=STATE_CONNECTING;
//                handler.sendMessage(message);
//
//                socket=serverSocket.accept();
//            } catch (IOException e) {
//                e.printStackTrace();
//                Message message=Message.obtain();
//                message.what=STATE_CONNECTION_FAILED;
//                handler.sendMessage(message);
//            }
//
//            if(socket!=null)
//            {
//                Message message=Message.obtain();
//                message.what=STATE_CONNECTED;
//                handler.sendMessage(message);
//
//                sendReceive=new SendReceiveThread(socket);
//                sendReceive.start();
//
//                break;
//            }
//        }
//    }
}
