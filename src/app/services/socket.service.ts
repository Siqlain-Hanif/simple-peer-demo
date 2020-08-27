import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import * as io from 'socket.io-client'
import { SelectItem } from 'primeng/api';
import * as SimplePeer from 'simple-peer';
import { PeerService } from './peer.service';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socketURL = 'https://agile-coast-68144.herokuapp.com'
  socket: SocketIOClient.Socket;

  username: any;
  peerUser: any;
  peer: any;
  peerData: any;
  private $isServerConnectedSource = new BehaviorSubject(0);
  get $isServerConnected() {
    return this.$isServerConnectedSource.asObservable()
  }
  private $onlineUsersSource = new BehaviorSubject([]);
  get $onlineUsers() {
    return this.$onlineUsersSource.asObservable();
  }
  private $userCallingSource = new BehaviorSubject(null);
  get $userCalling() {
    return this.$userCallingSource.asObservable();
  }


  constructor() {
    this.socket = io(this.socketURL);
    this.socket.on('connect', () => {
      this.$isServerConnectedSource.next(1);
      console.log("CONNECTION ESTABLISHED WITH SERVER");
      // console.log(this.socket.id);
    });
    this.socket.on('connect_error', () => {
      this.$isServerConnectedSource.next(0);
      console.log("CONNECTION ERROR");
    });
    this.socket.on('connect_timeout', () => {
      this.$isServerConnectedSource.next(0);
      console.log("CONNECTION TIMEOUT");
    });
    this.socket.on('reconnecting', (attemptNumber) => {
      this.$isServerConnectedSource.next(2);
      console.log("RECONECTING ", attemptNumber)
    });


    this.socket.on(`online_users`, (users: any[]) => {
      let onlineUsers: SelectItem[] = [];
      onlineUsers = users.map(user => {
        if (user.soc_id != this.socket.id)
          return {
            label: user.username,
            value: user
          }
      }).filter(function (x) { return x });
      this.$onlineUsersSource.next(onlineUsers);
    });
    this.socket.on(`new_connection`, (connection) => {
      let onlineUsers: SelectItem[] = this.$onlineUsersSource.value;
      // let index = onlineUsers.findIndex(user => connection.soc_id != this.socket.id && user.value.soc_id == connection.soc_id);
      if (connection.soc_id != this.socket.id) {
        onlineUsers.push({
          label: connection.username,
          value: connection
        });
        this.$onlineUsersSource.next(onlineUsers);
        console.log("New Connection Added", connection);
      }
      console.log("New Connection", connection);
    });
    this.socket.on(`left_connection`, (connection) => {
      let onlineUsers: SelectItem[] = this.$onlineUsersSource.value;
      let index = onlineUsers.findIndex(user => user.value.soc_id == connection.soc_id);
      if (index >= 0) {
        onlineUsers.splice(index, 1);
        this.$onlineUsersSource.next(onlineUsers);
      };
      console.log("Left Connection", connection);
    });

    this.socket.on(`call`, (user: any) => {
      this.$userCallingSource.next(user);
      this.peerData = user.data;
      this.peerUser = user.user;
      console.log('User calling');
    });
  }
  callAccepted() {
    this.$userCallingSource.next(null);
  }
  callRejected() {
    this.$userCallingSource.next(null);
  }
  callEnded() {
    this.$userCallingSource.next(null);
    this.peerData = null;
    this.peerUser = null;
    if (this.peer)
      this.peer.destroy();
  }
}
