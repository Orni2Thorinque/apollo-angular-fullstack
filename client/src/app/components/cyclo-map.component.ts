import { AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIconRegistry, MatTabChangeEvent } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ApolloService } from '../apollo-client/apollo-service';
import { StationModel } from '../models/station-model';
import { Contract, GeocodeSummary, Position } from '../types/types';
import { getBankIcon, getBikeIcon, getOverviewIcon, getReturnIcon, getTakeIcon, getWindowDimensions, nou, DEFAULT_LOCATION } from './cyclo-map.utils';

@Component({
  selector: 'cyclo-map',
  templateUrl: './cyclo-map.component.html',
  styleUrls: ['./cyclo-map.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class CycloMapComponent implements OnInit, AfterViewInit {
  private _contractTabRef: ElementRef;
  @ViewChild('tabRef', { read: ElementRef }) set contractTabRef(ref: ElementRef) {
    this._contractTabRef = ref;
  }

  public contextMode: 'DIRECTIONS' | 'CONTRACTS' | 'NORMAL' = 'NORMAL';
  public windowDims: Array<number>;
  public baseLocation: Position = DEFAULT_LOCATION;

  private _contracts: Contract[];
  private _stations: StationModel[];

  public selectedContract: Contract;
  public selectedContractInfo: GeocodeSummary;

  public isMapTypeSelection: boolean = false;
  public mapType: 'roadmap' | 'hybrid' | 'satellite' | 'terrain' = 'terrain';

  get stations(): Array<StationModel> {
    return this._stations ? this._stations : [];
  }
  get contracts(): Array<Contract> {
    return this._contracts ? this._contracts : [];
  }

  @HostListener('window:resize', ['$event']) public onResize(): void {
    this.windowDims = getWindowDimensions();
  }

  constructor(private apollo: ApolloService, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, private renderer: Renderer2) {
    this.windowDims = [0, 0];
    this.initData();
    this.initIconRegistry();
  }

  ngOnInit() {}

  private initData(): void {
    this.apollo.queryContracts().subscribe((contracts: Array<Contract>) => (this._contracts = contracts));
  }

  ngAfterViewInit() {
    setTimeout(() => this.onResize(), 100);
  }

  public toggleContract() {
    if (this.contextMode === 'CONTRACTS' && this._contractTabRef) {
      this.renderer.addClass(this._contractTabRef.nativeElement, 'translate-up');
    }

    setTimeout(() => (this.contextMode = this.contextMode === 'NORMAL' ? 'CONTRACTS' : 'NORMAL'), 1000);
  }

  public toggleMapType(): void {
    this.isMapTypeSelection = !this.isMapTypeSelection;
  }

  /**
   * Handle event in contract tab selection
   * @param {MatTabChangeEvent} event  tab select event
   */
  public onContractSelect(event: MatTabChangeEvent): void {
    const label = event.tab.textLabel;
    if (!nou(label)) {
      this.selectedContract = this.contracts.find((contract: Contract) => contract.name === label);
      this.loadContractStations(this.selectedContract);
    }
  }

  /**
   * Load station data for contract
   * @param {Contract} contract given contract
   */
  private loadContractStations(contract: Contract): void {
    const searchAddress = contract && contract.cities && contract.cities[0] ? contract.cities[0] : contract.name;
    this.apollo.queryLocation(searchAddress).subscribe((location: GeocodeSummary) => {
      if (location) {
        this.selectedContractInfo = location;
        this.rebaseMap(location.geometry.location);
      }
    });

    this.apollo.queryStationByContract(contract).subscribe(stations => {
      this._stations = stations;
    });
  }

  /**
   * Recenter map
   * @param {Position} position given position to center on
   */
  private rebaseMap(position: Position): void {
    if (position) {
      this.baseLocation.lat = position.lat;
      this.baseLocation.lng = position.lng;
    }
  }

  /**
   * Compute station icon base on its status
   * @param station given station
   */
  public getStationIcon(station: StationModel): string {
    switch (station.overviewStatus) {
      case 'OK':
        return '/assets/baseline_bike_ok.svg';
      case 'WARN':
        return '/assets/baseline_bike_warn.svg';
      case 'CRITICAL':
        return '/assets/baseline_bike_critical.svg';
      default:
        return '/assets/baseline_bike_warn.svg';
    }
  }

  /**
   * Compute station icon base on its status
   * @param station given station
   */
  public getViewIcon(station: StationModel, icon: 'TAKE' | 'RETURN' | 'BANK' | 'OVERVIEW' | 'BIKE', bike?: 'TAKE' | 'RETURN'): string {
    switch (icon) {
      case 'BIKE':
        return getBikeIcon(station, bike);
      case 'BANK':
        return getBankIcon(station);
      case 'TAKE':
        return getTakeIcon(station);
      case 'RETURN':
        return getReturnIcon(station);
      case 'OVERVIEW':
        return getOverviewIcon(station);
    }
  }

  private initIconRegistry(): void {
    this.iconRegistry
      .addSvgIcon('PLACE_OK', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/baseline_ok.svg'))
      .addSvgIcon('PLACE_WARN', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/baseline_warn.svg'))
      .addSvgIcon('PLACE_CRITICAL', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/baseline_critical.svg'))

      .addSvgIcon('BANK_OK', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/banking_ok.svg'))
      .addSvgIcon('BANK_WARN', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/banking_warn.svg'))
      .addSvgIcon('BANK_CRITICAL', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/banking_critical.svg'))

      .addSvgIcon('BIKE_OK', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/baseline_bike_ok.svg'))
      .addSvgIcon('BIKE_WARN', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/baseline_bike_warn.svg'))
      .addSvgIcon('BIKE_CRITICAL', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/baseline_bike_critical.svg'))

      .addSvgIcon('TAKE_OK', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/take_ok.svg'))
      .addSvgIcon('TAKE_WARN', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/take_warn.svg'))
      .addSvgIcon('TAKE_CRITICAL', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/take_critical.svg'))

      .addSvgIcon('RETURN_OK', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/return_ok.svg'))
      .addSvgIcon('RETURN_WARN', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/return_warn.svg'))
      .addSvgIcon('RETURN_CRITICAL', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/return_critical.svg'))

      .addSvgIcon('MAP_HYBRID', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/map_hybrid.svg'))
      .addSvgIcon('MAP_TERRAIN', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/map_terrain.svg'))
      .addSvgIcon('MAP_ROAD', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/map_road.svg'))
      .addSvgIcon('MAP_SATELLITE', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/map_satelite.svg'));
  }
}
