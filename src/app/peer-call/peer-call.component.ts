import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../services/socket.service';
import { PeerService } from '../services/peer.service';
import * as SimplePeer from 'simple-peer';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-peer-call',
  templateUrl: './peer-call.component.html',
  styleUrls: ['./peer-call.component.css']
})
export class PeerCallComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('theirStream', {
    read: ElementRef, static: false
  }) theirVideoEle: ElementRef;
  @ViewChild('myStream', {
    read: ElementRef, static: false
  }) myVideoEle: ElementRef;

  subscriptions: Subscription[] = [];
  userCalling: any;
  soc_id: string;
  user: any;
  status: any;
  n = <any>navigator;
  localstream;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public socketService: SocketService,
    private peerService: PeerService) {
    this.activatedRoute.queryParams.subscribe(res => {
      this.status = res.status;
    })
    this.activatedRoute.params.subscribe(res => {
      this.soc_id = res.id;
      this.socketService.$onlineUsers.subscribe((users) => {
        let index = users.findIndex(user => user.value.soc_id == this.soc_id)
        if (index >= 0)
          //To whom we are calling;
          this.user = users[index];
        else
          router.navigate(['../']);
      })
    })

  }
  ngOnDestroy() {
    let myVideo = this.myVideoEle.nativeElement;
    let theirVideo = this.theirVideoEle.nativeElement;
    myVideo.pause();
    theirVideo.pause();
    theirVideo.removeAttribute('src'); // empty source
    myVideo.removeAttribute('src'); // empty source
    myVideo.load();
    theirVideo.load();
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
  ngOnInit(): void {
    this.subscriptions.push(this.socketService.$userCalling.subscribe(user => {
      if (user != null) {
        this.userCalling = user.user;
      }
    }));
  }
  ngAfterViewInit() {
    let myVideo = this.myVideoEle.nativeElement;
    let theirVideo = this.theirVideoEle.nativeElement;
    // this.socketService.$peerConnected.subscribe((peer) => {
    this.n.getUserMedia = (this.n.getUserMedia || this.n.webkitGetUserMedia || this.n.mozGetUserMedia || this.n.msGetUserMedia);
    this.n.getUserMedia({
      video: true, audio: true
    }, (stream) => {
      myVideo.srcObject = stream;
      myVideo.muted = true;
      myVideo.play();
      let initiator = this.status == 'calling';
      this.socketService.peer = new SimplePeer({ initiator: initiator, trickle: false, stream: stream });

      this.socketService.socket.on('accepted-call', (res) => {
        console.log("Accepted")
        this.socketService.callAccepted();
        this.socketService.peerUser = res.user;
        this.socketService.peer.signal(res.data);
      });
      this.socketService.socket.on('rejected-call', (data) => {
        //Just Navigate back for now.. TODO : will add snackbar for indicating
        this.socketService.callRejected();
        this.router.navigate(['../']);
      });
      this.socketService.socket.on('end-call', (data) => {
        console.log("Ended")
        //Just Navigate back and remove any peer data 
        this.socketService.peer.removeStream(stream);
        myVideo.pause();
        myVideo.src = "";
        myVideo.load();
        theirVideo.pause();
        theirVideo.src = "";
        theirVideo.load();
        // this.localstream.getTracks()[0].stop()
        this.socketService.callEnded();
        this.router.navigate(['../']);
      });
      this.socketService.peer.on('connect', () => {
        console.log('Connected');
      });
      this.socketService.peer.on('close', () => {
        console.log('Closed Called');
      });
      this.socketService.peer.on('signal', (data) => {
        let serialized = JSON.stringify(data);
        if (this.status == 'calling') {
          console.log('calling');
          this.peerService.callUser(this.soc_id, serialized).subscribe(res => {
            console.log(res);
            this.status = 'whatever';
          }, error => {
            console.log(error.error);
          });
        } else if (this.status == 'recieving') {
          this.peerService.acceptCall(this.userCalling.soc_id, serialized).subscribe(res => {
            this.userCalling = null;
            this.status = 'whatever';
          });
        } else {
          console.log("Established");
        }
        console.log("Emit to remote peer");
      });
      this.socketService.peer.on('error', (e) => {
        console.log(e);
      });
      this.socketService.peer.on('stream', (stream) => {
        theirVideo.srcObject = stream;
        theirVideo.play();
        console.log('data')
      });
    }, (error) => {
      console.log(error);
    });
    // })
  }
  acceptCall() {
    this.socketService.peer.signal(this.socketService.peerData);
  }
  rejectCall() {
    this.peerService.rejectCall(this.userCalling.soc_id).subscribe(res => {
      this.router.navigate(['../']);
    });
  }
  endCall() {
    this.peerService.endCall(this.socketService.peerUser.soc_id).subscribe(res => {
      this.router.navigate(['../']);
    });
  }
}
