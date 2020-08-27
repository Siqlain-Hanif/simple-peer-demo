import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SocketService } from './socket.service';
import * as SimplePeer from 'simple-peer';

@Injectable({
  providedIn: 'root'
})
export class PeerService {
  webApiUrl = 'https://agile-coast-68144.herokuapp.com/'
  methodName = "users";
  constructor(private httpClient: HttpClient, private socketService: SocketService) { }

  pingUser(username: string) {
    let url = `${this.webApiUrl}${this.methodName}/ping`;
    console.log(url);
    return this.httpClient.post(url, {
      soc_id: this.socketService.socket.id,
      username: username
    });
  }
  callUser(to_id: string, data: string) {
    let url = `${this.webApiUrl}${this.methodName}/call`;
    console.log(url);
    return this.httpClient.post(url, {
      soc_id: this.socketService.socket.id,
      to_id: to_id,
      data: data
    });
  }
  acceptCall(to_id: string, data: string) {
    let url = `${this.webApiUrl}${this.methodName}/accept-call`;
    console.log(url);
    return this.httpClient.post(url, {
      soc_id: this.socketService.socket.id,
      to_id: to_id,
      data: data,
    });
  }
  rejectCall(to_id: string) {
    let url = `${this.webApiUrl}${this.methodName}/reject-call`;
    console.log(url);
    return this.httpClient.post(url, {
      soc_id: this.socketService.socket.id,
      to_id: to_id,
    });
  }
  endCall(to_id: string) {
    let url = `${this.webApiUrl}${this.methodName}/end-call`;
    console.log(url);
    return this.httpClient.post(url, {
      soc_id: this.socketService.socket.id,
      to_id: to_id,
    });
  }
}
