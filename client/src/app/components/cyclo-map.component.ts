import { AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIconRegistry, MatTabChangeEvent } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApolloService } from '../apollo-client/apollo-service';
import { StationModel } from '../models/station-model';
import { Contract, GeocodeSummary, Position, Station, DirectionSummary, Step } from '../types/types';
import { DEFAULT_FOCUS_ZOOM, DEFAULT_LOCATION, DEFAULT_RENDERING_DELAY_PER_STATION, DEFAULT_START_ZOOM, DEFAUL_MAP_TYPE, getBankIcon, getBikeIcon, getOverviewIcon, getReturnIcon, getTakeIcon, getWindowDimensions, nou } from './cyclo-map.utils';
import { PolyMouseEvent, InfoWindowManager, AgmInfoWindow } from '@agm/core';

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

  private _mapToggleRef: ElementRef;
  @ViewChild('toggleRef', { read: ElementRef }) set mapTypeRef(ref: ElementRef) {
    this._mapToggleRef = ref;
  }

  private _stations: StationModel[];
  get stations(): Array<StationModel> {
    return this._stations ? this._stations : [];
  }

  private _contracts: Contract[];
  get contracts(): Array<Contract> {
    return this._contracts ? this._contracts : [];
  }

  public contextMode: 'DIRECTIONS' | 'CONTRACTS' | 'NORMAL';
  public windowDims: Array<number>;
  public baseLocation: Position;
  public zoom: number;
  public isLoading: boolean;
  public isDirectionVisible: boolean;

  public selectedContract: Contract;
  public selectedContractInfo: GeocodeSummary;

  public isMapTypeSelection: boolean = false;
  public mapType: 'roadmap' | 'hybrid' | 'satellite' | 'terrain';

  public endpoints: StationModel[] = [];
  public directions: DirectionSummary;
  public directionSegmentInfo: {
    distance: string;
    duration: string;
    position: Position;
    startAddress: string;
    endAddress: string;
  };
  @ViewChild('directionWindow', { read: AgmInfoWindow }) directionInfoWindow: AgmInfoWindow;

  @HostListener('window:resize', ['$event']) public onResize(): void {
    this.windowDims = getWindowDimensions();
  }

  constructor(
    private apollo: ApolloService, //
    private spinner: NgxSpinnerService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2
  ) {
    this.initData();
    this.initIconRegistry();
  }

  ngOnInit() {}

  // Init view with default data
  private initData(): void {
    // Set default values
    this.windowDims = [0, 0];
    this.isLoading = false;
    this.zoom = DEFAULT_START_ZOOM;
    this.baseLocation = DEFAULT_LOCATION;
    this.mapType = DEFAUL_MAP_TYPE;
    this.baseLocation = DEFAULT_LOCATION;
    this.contextMode = 'NORMAL';
    this.isDirectionVisible = false;

    this.directionSegmentInfo = {
      distance: null,
      duration: null,
      position: null,
      startAddress: null,
      endAddress: null,
    };

    // Load contracts
    this.apollo.queryContracts().subscribe((contracts: Array<Contract>) => (this._contracts = contracts));
  }

  ngAfterViewInit() {
    // Resize on load
    setTimeout(() => this.onResize(), 100);
  }

  // Handle contracts toggling
  public onToggleContract() {
    if (this.contextMode === 'CONTRACTS' && this._contractTabRef) {
      this.renderer.addClass(this._contractTabRef.nativeElement, 'translate-up');
    }

    setTimeout(() => {
      this.contextMode = this.contextMode === 'NORMAL' ? 'CONTRACTS' : 'NORMAL';
      this.endpoints = [];
    }, 500);
  }

  // Handle map type toggling
  public onToggleMapType(): void {
    if (this.isMapTypeSelection) {
      this.renderer.addClass(this._mapToggleRef.nativeElement, 'translate-toggle-down');
    }

    setTimeout(() => (this.isMapTypeSelection = !this.isMapTypeSelection), 600);
  }

  /**
   * Set endpoint for distance search
   * IF already assigned, unassign
   * @param station given station to assign
   * @param position (0 as start location, 1 as end location)
   */
  public onToggleEndpoint(station: StationModel, position: 0 | 1): void {
    this.directionInfoWindow.close().then();

    if (nou(this.endpoints[position])) {
      this.endpoints[position] = station;
    } else if (this.endpoints[position] === station) {
      this.endpoints[position] = null;
    } else {
      this.endpoints[position] = station;
    }
  }

  /**
   * Handle directions search
   */
  public onFindDirections(): void {
    this.spinner.show();

    if (this.endpoints && this.endpoints[0] && this.endpoints[1]) {
      this.apollo
        .queryDirectionsByCoordinates(this.endpoints[0].position, this.endpoints[1].position) //
        .subscribe((directions: DirectionSummary) => {
          if (directions) {
            this.directions = directions;
            this.spinner.hide();
          }
        });
    }
  }

  /**
   * Handle event in contract tab selection
   * @param {MatTabChangeEvent} event  tab select event
   */
  public onContractSelect(event: MatTabChangeEvent): void {
    this.directionInfoWindow.close();

    const label = event.tab.textLabel;
    if (!nou(label)) {
      this.selectedContract = this.contracts.find((contract: Contract) => contract.name === label);
      this.loadContractStations(this.selectedContract);
      this.endpoints = [null, null];
    }
  }

  /**
   * Handle polyline info toggle
   * @param {PolyMouseEvent} event polyline click event
   */
  public onTogglePolylineInfo(event: PolyMouseEvent): void {
    const position: Position = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    this.directionSegmentInfo.position = position;
    this.directionSegmentInfo.distance = this.directions.distanceText;
    this.directionSegmentInfo.duration = this.directions.durationText;
    this.directionSegmentInfo.startAddress = this.directions.startLocationText;
    this.directionSegmentInfo.endAddress = this.directions.endLocationText;

    this.isDirectionVisible = true;
    this.directionInfoWindow.open().then();
  }

  /**
   * Load station data for contract and rebase map
   * @param {Contract} contract given contract
   */
  private loadContractStations(contract: Contract): void {
    this.spinner.show();
    const searchAddress = contract && contract.cities && contract.cities[0] ? contract.cities[0] : contract.name;

    this.apollo.queryLocation(searchAddress).subscribe((location: GeocodeSummary) => {
      if (location) {
        this.selectedContractInfo = location;
        this.rebaseMap(location.geometry.location);
      }
    });

    this.apollo.queryStationByContract(contract).subscribe(stations => {
      this._stations = stations;
      this.endpoints = [this._stations[0], this._stations[1]];
      setTimeout(() => this.spinner.hide(), DEFAULT_RENDERING_DELAY_PER_STATION * this._stations.length);
    });
  }

  /**
   * Recenter map
   * @param {Position} position given position to rebase to
   */
  private rebaseMap(position: Position): void {
    if (position) {
      this.baseLocation.lat = position.lat;
      this.baseLocation.lng = position.lng;
      this.zoom = DEFAULT_FOCUS_ZOOM;
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
      .addSvgIcon('MAP_SATELLITE', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/map_satelite.svg'))

      .addSvgIcon('DIRECTION_START', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/direction_start.svg'))
      .addSvgIcon('DIRECTION_END', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/direction_end.svg'));
  }
}
