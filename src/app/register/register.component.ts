import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { PeerService } from '../services/peer.service';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  username: string;
  users: SelectItem[] = [];
  userCalling: any;

  selectedUser: any;
  registering = false;
  constructor(private router: Router,
    private peerService: PeerService,
    public socketService: SocketService,
  ) { }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
  ngOnInit(): void {
    this.username = this.socketService.username;
    this.subscriptions.push(this.socketService.$onlineUsers.subscribe(res => {
      this.users = [...res];


    }))
    this.subscriptions.push(this.socketService.$userCalling.subscribe(user => {
      if (user != null) {
        this.userCalling = user.user;
        this.router.navigate(['peer', this.userCalling.soc_id], { queryParams: { status: 'recieving' } });
      }

    }));
  }
  register() {
    this.registering = true;
    this.peerService.pingUser(this.username).subscribe((res: any) => {
      this.socketService.username = res.username;
      this.registering = false;
    }, (error) => {
      console.log(error);
      this.registering = false;
    }, () => {
      this.registering = false;
    })

  }
  onUserSelect(event) {
    if (!this.socketService.username) return;
    this.router.navigate(['peer', event.value.soc_id], { queryParams: { status: 'calling' } });
  }

}
