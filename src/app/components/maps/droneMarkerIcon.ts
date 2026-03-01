import L from 'leaflet';

type DroneStatus = 'active' | 'standby' | 'idle' | string;

interface MarkerOptions {
  name: string;
  status: DroneStatus;
  battery?: number;
  selected?: boolean;
  labelOffset?: number;
}

function getStatusClass(status: DroneStatus, battery?: number) {
  if (status === 'standby') {
    return 'standby';
  }

  if (typeof battery === 'number' && battery < 20) {
    return 'critical';
  }

  return 'active';
}

function getStatusText(status: DroneStatus) {
  if (status === 'standby') {
    return 'Standby';
  }

  if (status === 'idle') {
    return 'Idle';
  }

  return 'Active';
}

export function createDroneMarkerIcon({ name, status, battery, selected = false, labelOffset = 0 }: MarkerOptions) {
  const safeName = String(name || 'Drone');
  const statusClass = getStatusClass(status, battery);
  const statusText = getStatusText(status);
  const batteryText = typeof battery === 'number' ? `${Math.round(battery)}%` : '';

  return L.divIcon({
    className: 'drone-label-icon',
    html: `
      <div class="drone-marker-wrapper ${statusClass} ${selected ? 'selected' : ''}" style="--label-offset:${labelOffset}px;">
        <span class="drone-dot"></span>
        <div class="drone-label-bubble">
          <div class="drone-label-row">
            <span class="drone-label-name">${safeName}</span>
            <span class="drone-status-pill">${statusText}</span>
          </div>
          ${batteryText ? `<div class="drone-label-sub">${batteryText}</div>` : ''}
        </div>
      </div>
    `,
    iconSize: [190, 46],
    iconAnchor: [12, 22],
    popupAnchor: [0, -16],
  });
}
