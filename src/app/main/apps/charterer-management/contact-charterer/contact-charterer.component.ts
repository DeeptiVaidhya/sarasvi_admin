import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import { UserService } from '../../../../_services/user.service';
import { HttpClient } from '@angular/common/http';
import { config } from '../../../../config/config';
import { first } from 'rxjs/operators';
import { AlertService } from '../../../../_services';
import { Router } from '@angular/router';

const dummyData = [{
  'id': '1',
  'roleName': 'admin'
}];
export interface UserData {
  id: string;
  Name: string;
  mobileno: string;
  email: string;
  company: string;
  
}

@Component({
  selector: 'app-contact-charterer',
  templateUrl: './contact-charterer.component.html',
  styleUrls: ['./contact-charterer.component.scss']
})
export class ContactChartererComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['id', 'name', 'mobileno'];
    dialogRef: any;
    hasSelectedContacts: boolean;
    searchInput: FormControl;
    showModalStatus = false;
    dataSource: MatTableDataSource<UserData>;

    roleListRes: any;
    roleListData: any;
    roleName: string;
    name: string;
    mobileno: string; 
    email: string; 
    company: string;  
    userRole: string;
    userDeleteRoleId: any;
    userListRes: any;
    userListData: any;
    showModaldeleteStatus = false;
    roleId: any;
    deleteRoleRes: any;
    status = 'Y';
    filterValue: string;
    userRoleId: any;
    tempUserListData: any;
    patientName: any;
    // Private
    
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    // @Input() charterer : ChartererManagementComponent;

    /**
     * Constructor
     *
     * @param {ContactsService} _contactsService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {MatDialog} _matDialog
     */

  constructor(
    // private _contactsService: ContactsService,
    private _userService: UserService,
    private _fuseSidebarService: FuseSidebarService,
    private http: HttpClient, 
    private alertService: AlertService,
    private router: Router
  ) { 
    // Set the defaults
    this.filterValue = '';
    this.userListData = [];
    this.roleListData = [];
    this.userRoleId = '';
    this.dataSource = new MatTableDataSource(this.userListData);

    this.patientName = localStorage.getItem('patientName')

    let userToken = localStorage.getItem('userToken')
    if(userToken==undefined){
        this.router.navigate(['/']);
    }
  }


      // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    
        let patientId = localStorage.getItem('patientId')
        const paramsData = {
            "patient_id" : patientId
        }
        this.contactList();
        // this.roleList();
  }

  /**
     * On destroy
     */
    ngOnDestroy(): void {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    /**
     * Toggle the sidebar
     *
     * @param name
     */
    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

    showModal(): void {
        this.showModalStatus = !this.showModalStatus;
        // console.log(this.showModalStatus);
    }

    applyFilter(filterValue: string): void {
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    editRole(id): void {      
        localStorage.setItem('chartererId', id);
        this.router.navigate(['/apps/charterer-management/edit-charterer']);
    }

     contactRole(id): void {      
        localStorage.setItem('chartererId', id);
        this.router.navigate(['/apps/charterer-management/contact-charterer']);
    }
    
   

    contactList(): void {
        try {
            let patientId = localStorage.getItem('patientId')
           const paramsData = {
              "patient_id" : patientId
           }
            this._userService.getcontactList(paramsData)
            .pipe(first())
            .subscribe((res) => {
                this.userListRes = res;
                if (this.userListRes.success === true) {
                    this.tempUserListData = this.userListRes.data;
                    this.userListData = this.userListRes.data;
                    this.dataSource = new MatTableDataSource(this.userListData);
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                }
            },
            err => {
                console.log(err);
            });
            
        } catch (err) {
            console.log(err);
        }
    }

    // Delete Role
    deletecharter(id): void {
        const req = {
            isDelete: 'Y',      
            id: this.userRoleId,
        };
        try {
            this.http
                .post(`${config.baseUrl}/charterdelete`, req, {})
                .subscribe(
                    res => {
                        console.log(res);
                        this.deleteRoleRes = res;
                        if (this.deleteRoleRes.success === true) {
                            this.alertService.success('Successfully Deleted', 'Success');
                            // this.chartererList();
                            this.showModaldeleteStatus = false;
                        } else {
                            this.alertService.error(this.deleteRoleRes.message, 'Error');
                        }
                    },
                    err => {
                        console.log(err);
                        this.alertService.error(err.message, 'Error');
                    }
                );
        } catch (err) {
            console.log(err);
        }
    } 
    
    changeRole(event): void {
        console.log(event.target.value);
        this.userRoleId = event.target.value;
    }

    showDeleteModal(id): void {
        this.userRoleId = id;
        this.showModaldeleteStatus = !this.showModaldeleteStatus;
    }
    hideDeleteModal(): void {
        this.showModaldeleteStatus = !this.showModaldeleteStatus;
    }


}
