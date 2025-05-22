// Accessibility Features
document.addEventListener('DOMContentLoaded', function() {
    // Inicialização do site
    initAccessibilityFeatures();
    initMap();
    initFilters();
});

// Accessibility Features
function initAccessibilityFeatures() {
    // Toggle high contrast mode
    const contrastToggle = document.getElementById('toggle-contrast');
    contrastToggle.addEventListener('click', function() {
        document.body.classList.toggle('high-contrast');
        const isHighContrast = document.body.classList.contains('high-contrast');
        contrastToggle.setAttribute('aria-pressed', isHighContrast);
        
        // Announce change to screen readers
        announceToScreenReader(`Alto contraste ${isHighContrast ? 'ativado' : 'desativado'}`);
        
        // Save preference to localStorage
        localStorage.setItem('highContrast', isHighContrast);
    });
    
    // Increase font size
    const increaseFont = document.getElementById('increase-font');
    increaseFont.addEventListener('click', function() {
        if (document.body.classList.contains('font-xlarge')) {
            return; // Already at maximum size
        } else if (document.body.classList.contains('font-large')) {
            document.body.classList.remove('font-large');
            document.body.classList.add('font-xlarge');
            localStorage.setItem('fontSize', 'xlarge');
            announceToScreenReader('Tamanho da fonte aumentado para muito grande');
        } else {
            document.body.classList.add('font-large');
            localStorage.setItem('fontSize', 'large');
            announceToScreenReader('Tamanho da fonte aumentado para grande');
        }
    });
    
    // Decrease font size
    const decreaseFont = document.getElementById('decrease-font');
    decreaseFont.addEventListener('click', function() {
        if (document.body.classList.contains('font-xlarge')) {
            document.body.classList.remove('font-xlarge');
            document.body.classList.add('font-large');
            localStorage.setItem('fontSize', 'large');
            announceToScreenReader('Tamanho da fonte diminuído para grande');
        } else if (document.body.classList.contains('font-large')) {
            document.body.classList.remove('font-large');
            localStorage.setItem('fontSize', 'normal');
            announceToScreenReader('Tamanho da fonte diminuído para normal');
        }
    });
    
    // Toggle voice navigation
    const voiceToggle = document.getElementById('toggle-voice');
    voiceToggle.addEventListener('click', function() {
        const voiceEnabled = localStorage.getItem('voiceEnabled') === 'true';
        localStorage.setItem('voiceEnabled', !voiceEnabled);
        announceToScreenReader(`Narração ${!voiceEnabled ? 'ativada' : 'desativada'}`);
    });
    
    // Load saved preferences
    loadSavedPreferences();
    
    // Add keyboard navigation for the filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('keydown', function(e) {
            // Left arrow key
            if (e.keyCode === 37) {
                const prev = button.previousElementSibling;
                if (prev && prev.classList.contains('filter-btn')) {
                    prev.focus();
                }
            }
            // Right arrow key
            else if (e.keyCode === 39) {
                const next = button.nextElementSibling;
                if (next && next.classList.contains('filter-btn')) {
                    next.focus();
                }
            }
        });
    });
}

// Load saved accessibility preferences
function loadSavedPreferences() {
    // High contrast
    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
        document.getElementById('toggle-contrast').setAttribute('aria-pressed', 'true');
    }
    
    // Font size
    const fontSize = localStorage.getItem('fontSize');
    if (fontSize === 'large') {
        document.body.classList.add('font-large');
    } else if (fontSize === 'xlarge') {
        document.body.classList.add('font-xlarge');
    }
}

// Announce message to screen readers
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.classList.add('sr-only');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
    
    // If voice is enabled, use speech synthesis
    if (localStorage.getItem('voiceEnabled') === 'true') {
        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = 'pt-BR';
        window.speechSynthesis.speak(speech);
    }
}

// Map initialization and location data
let map;
let markers = [];
let currentFilter = 'all';
let routeControl = null;
let activeLocationId = null;
let userPositionMarker = null;
let userWatchId = null;
let activeDestination = null;

// Initialize the map
function initMap() {
    // Create map centered on Orla da Atalaia, Aracaju
    map = L.map('map').setView([-10.9772, -37.0397], 15);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Load accessibility locations
    loadAccessibilityLocations();
    
    // Add map controls with accessible labels
    const zoomControl = L.control.zoom({
        zoomInTitle: 'Aumentar zoom',
        zoomOutTitle: 'Diminuir zoom'
    }).addTo(map);
    
    // Initialize route instructions close button
    document.getElementById('close-route').addEventListener('click', function() {
        hideRouteInstructions();
        if (routeControl) {
            map.removeControl(routeControl);
            routeControl = null;
        }
        
        // Stop tracking user position when route is closed
        stopTrackingUserPosition();
        activeDestination = null;
    });
    
    // Start tracking user position
    startTrackingUserPosition();
}

// Start tracking user position
function startTrackingUserPosition() {
    // Check if geolocation is available
    if ('geolocation' in navigator) {
        // Create a custom icon for user position
        const userIcon = L.divIcon({
            className: 'user-position-icon',
            html: '<i class="fas fa-circle"></i>',
            iconSize: [20, 20]
        });
        
        // Add user position marker to map (initially hidden)
        userPositionMarker = L.marker([0, 0], {
            icon: userIcon,
            zIndexOffset: 1000, // Make sure it's on top of other markers
            title: 'Sua posição atual',
            alt: 'Sua posição atual'
        });
        
        // Start watching user position
        userWatchId = navigator.geolocation.watchPosition(
            function(position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                // Update user position marker
                if (!userPositionMarker._map) {
                    userPositionMarker.setLatLng([userLat, userLng]).addTo(map);
                } else {
                    userPositionMarker.setLatLng([userLat, userLng]);
                }
                
                // If there's an active destination, update the route
                if (activeDestination) {
                    updateRouteToDestination(userLat, userLng, activeDestination);
                }
                
                // Center map on user position if this is the first position update
                if (!userPositionMarker._map) {
                    map.setView([userLat, userLng], 16);
                }
                
                // Announce to screen readers
                announceToScreenReader('Posição atualizada');
            },
            function(error) {
                console.error('Erro ao obter localização:', error);
                announceToScreenReader('Não foi possível obter sua localização');
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );
    } else {
        announceToScreenReader('Geolocalização não disponível neste dispositivo');
    }
}

// Stop tracking user position
function stopTrackingUserPosition() {
    if (userWatchId !== null) {
        navigator.geolocation.clearWatch(userWatchId);
        userWatchId = null;
    }
    
    if (userPositionMarker && userPositionMarker._map) {
        map.removeLayer(userPositionMarker);
    }
}

// Update route to destination
function updateRouteToDestination(userLat, userLng, destination) {
    // If there's already a route control, update the waypoints
    if (routeControl) {
        routeControl.setWaypoints([
            L.latLng(userLat, userLng),
            L.latLng(destination.lat, destination.lng)
        ]);
    }
}

// Load accessibility locations data
function loadAccessibilityLocations() {
    // In a real application, this data would come from an API or database
    // For this example, we'll use hardcoded data for locations in Orla da Atalaia, Aracaju
    const accessibilityLocations = [
        {
            id: 1,
            name: "Rampa de Acesso - Praia dos Artistas",
            description: "Rampa de acesso à praia para cadeirantes e pessoas com mobilidade reduzida.",
            lat: -10.9772,
            lng: -37.0397,
            image: "images/ramp.png",
            features: ["ramp"],
            details: "Rampa com inclinação adequada, corrimãos em ambos os lados e piso antiderrapante."
        },
        {
            id: 2,
            name: "Banheiro Acessível - Praça de Eventos",
            description: "Banheiro totalmente adaptado para pessoas com deficiência.",
            lat: -10.9782,
            lng: -37.0387,
            image: "images/bathroom.png",
            features: ["bathroom"],
            details: "Banheiro com barras de apoio, espaço para manobra de cadeira de rodas, pia em altura adequada e alarme de emergência."
        },
        {
            id: 3,
            name: "Estacionamento Reservado - Oceanário",
            description: "Vagas de estacionamento reservadas para pessoas com deficiência próximas ao Oceanário.",
            lat: -10.9762,
            lng: -37.0407,
            image: "images/parking.png",
            features: ["parking"],
            details: "Vagas demarcadas com o símbolo internacional de acessibilidade, espaço adicional para embarque/desembarque e proximidade da entrada."
        },
        {
            id: 4,
            name: "Piso Tátil - Calçadão Central",
            description: "Piso tátil direcional e de alerta ao longo do calçadão central da Orla.",
            lat: -10.9752,
            lng: -37.0417,
            image: "images/tactile.png",
            features: ["tactile"],
            details: "Piso tátil direcional que guia pessoas com deficiência visual pelo calçadão e piso de alerta para sinalizar obstáculos e mudanças de direção."
        },
        {
            id: 5,
            name: "Centro de Informações Turísticas - Braille",
            description: "Centro de informações com materiais em Braille e atendentes capacitados.",
            lat: -10.9742,
            lng: -37.0427,
            image: "images/info.png",
            features: ["braille", "libras"],
            details: "Mapas táteis, folhetos em Braille e atendentes capacitados em Libras para auxiliar visitantes com deficiência visual ou auditiva."
        },
        {
            id: 6,
            name: "Restaurante Acessível - Orla Gastronômica",
            description: "Restaurante com acessibilidade completa, incluindo cardápio em Braille e atendimento em Libras.",
            lat: -10.9732,
            lng: -37.0437,
            image: "images/restaurant.png",
            features: ["ramp", "bathroom", "braille", "libras"],
            details: "Entrada com rampa, banheiro acessível, cardápio em Braille, atendentes capacitados em Libras e mesas adaptadas para cadeirantes."
        },
        {
            id: 7,
            name: "Playground Inclusivo",
            description: "Área de lazer com brinquedos adaptados para crianças com deficiência.",
            lat: -10.9722,
            lng: -37.0447,
            image: "images/playground.png",
            features: ["ramp", "tactile"],
            details: "Brinquedos adaptados para crianças com diferentes tipos de deficiência, piso emborrachado e rampas de acesso."
        },
        {
            id: 8,
            name: "Mirante Acessível",
            description: "Mirante com vista para o mar, totalmente acessível para pessoas com mobilidade reduzida.",
            lat: -10.9712,
            lng: -37.0457,
            image: "images/viewpoint.png",
            features: ["ramp", "tactile"],
            details: "Plataforma elevada com rampa de acesso, corrimãos, piso antiderrapante e placas informativas em Braille."
        }
    ];
    
    // Add markers to map and create location cards
    addMarkersToMap(accessibilityLocations);
    createLocationCards(accessibilityLocations);
}

// Add markers to the map
function addMarkersToMap(locations) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Add new markers
    locations.forEach(location => {
        // Only add markers that match the current filter
        if (currentFilter === 'all' || location.features.includes(currentFilter)) {
            // Create custom icon based on location type
            const iconClass = getIconClassForFeatures(location.features);
            
            const customIcon = L.divIcon({
                className: 'accessibility-icon',
                html: `<i class="${iconClass}"></i>`,
                iconSize: [30, 30]
            });
            
            // Create marker
            const marker = L.marker([location.lat, location.lng], {
                icon: customIcon,
                title: location.name,
                alt: location.name
            }).addTo(map);
            
            // Add popup
            marker.bindPopup(`
                <div class="map-popup">
                    <h3>${location.name}</h3>
                    <p>${location.description}</p>
                    <button class="btn popup-details-btn" data-id="${location.id}">Ver Detalhes</button>
                </div>
            `);
            
            // Add click event to popup button
            marker.on('popupopen', function() {
                const popupDetailsBtn = document.querySelector(`.popup-details-btn[data-id="${location.id}"]`);
                if (popupDetailsBtn) {
                    popupDetailsBtn.addEventListener('click', function() {
                        showLocationDetails(location);
                    });
                }
            });
            
            markers.push(marker);
        }
    });
}

// Get icon class based on location features
function getIconClassForFeatures(features) {
    if (features.includes('ramp')) {
        return 'fas fa-wheelchair';
    } else if (features.includes('bathroom')) {
        return 'fas fa-toilet';
    } else if (features.includes('parking')) {
        return 'fas fa-parking';
    } else if (features.includes('tactile')) {
        return 'fas fa-walking';
    } else if (features.includes('braille')) {
        return 'fas fa-braille';
    } else if (features.includes('libras')) {
        return 'fas fa-sign-language';
    } else {
        return 'fas fa-universal-access';
    }
}

// Create location items in the sidebar
function createLocationCards(locations) {
    const locationsSidebar = document.getElementById('locations-sidebar');
    locationsSidebar.innerHTML = '';
    
    // Filter locations based on current filter
    const filteredLocations = currentFilter === 'all' 
        ? locations 
        : locations.filter(location => location.features.includes(currentFilter));
    
    // Create sidebar items for filtered locations
    filteredLocations.forEach(location => {
        const item = document.createElement('div');
        item.className = 'location-item';
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `${location.name}: ${location.description}`);
        item.setAttribute('data-id', location.id);
        
        // Check if this is the active location
        if (activeLocationId === location.id) {
            item.classList.add('active');
        }
        
        // Get the primary icon for this location
        const iconClass = getIconClassForFeatures(location.features);
        
        // Create feature tags HTML
        const featureTags = location.features.map(feature => {
            return `<span class="feature-tag">${getFeatureName(feature)}</span>`;
        }).join('');
        
        item.innerHTML = `
            <div class="location-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="location-info">
                <h3>${location.name}</h3>
                <p>${location.description}</p>
                <div class="location-actions">
                    <button class="details-btn" data-id="${location.id}">
                        <i class="fas fa-info-circle"></i> Detalhes
                    </button>
                    <button class="route-btn" data-id="${location.id}">
                        <i class="fas fa-route"></i> Rota
                    </button>
                </div>
            </div>
        `;
        
        // Add click event to highlight on map
        item.addEventListener('click', function() {
            highlightLocation(location);
        });
        
        // Add click events to buttons
        item.querySelector('.details-btn').addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering the parent click
            showLocationDetails(location);
        });
        
        item.querySelector('.route-btn').addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering the parent click
            showRoute(location);
        });
        
        // Add keyboard event for accessibility
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                highlightLocation(location);
            }
        });
        
        locationsSidebar.appendChild(item);
    });
    
    // If no locations match the filter
    if (filteredLocations.length === 0) {
        locationsSidebar.innerHTML = `
            <div class="no-results">
                <p>Nenhum local encontrado com o filtro selecionado.</p>
            </div>
        `;
    }
    
    // Announce to screen readers
    announceToScreenReader(`${filteredLocations.length} locais encontrados`);
}

// Highlight a location on the map and in the sidebar
function highlightLocation(location) {
    // Update active location ID
    activeLocationId = location.id;
    
    // Update sidebar items
    const sidebarItems = document.querySelectorAll('.location-item');
    sidebarItems.forEach(item => {
        if (parseInt(item.getAttribute('data-id')) === location.id) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Find the marker for this location
    const marker = markers.find(m => m.options.title === location.name);
    if (marker) {
        // Center map on this location
        map.setView([location.lat, location.lng], 17);
        
        // Open the popup
        marker.openPopup();
    }
    
    // Announce to screen readers
    announceToScreenReader(`Localização selecionada: ${location.name}`);
}

// Show route to a location
function showRoute(location) {
    if (routeControl) {
        map.removeControl(routeControl);
        routeControl = null;
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const userLatLng = [position.coords.latitude, position.coords.longitude];
            routeControl = L.Routing.control({
                waypoints: [
                    L.latLng(userLatLng[0], userLatLng[1]),
                    L.latLng(location.lat, location.lng)
                ],
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                createMarker: function() { return null; }
            }).addTo(map);
        }, function() {
            alert('Não foi possível obter sua localização.');
        });
    } else {
        alert('Geolocalização não suportada pelo navegador.');
    }
}

function createRoute(userLat, userLng, location) {
    // Create routing control
    routeControl = L.Routing.control({
        waypoints: [
            L.latLng(userLat, userLng),
            L.latLng(location.lat, location.lng)
        ],
        routeWhileDragging: false,
        showAlternatives: true,
        altLineOptions: {
            styles: [
                {color: 'black', opacity: 0.15, weight: 9},
                {color: 'white', opacity: 0.8, weight: 6},
                {color: 'blue', opacity: 0.5, weight: 2}
            ]
        },
        lineOptions: {
            styles: [
                {color: 'black', opacity: 0.15, weight: 9},
                {color: 'white', opacity: 0.8, weight: 6},
                {color: 'blue', opacity: 0.5, weight: 2}
            ]
        },
        router: L.Routing.osrmv1({
            language: 'pt-BR',
            profile: 'walking'
        }),
        createMarker: function() { return null; } // Don't create default markers
    }).addTo(map);
    
    // When route is found, show instructions
    routeControl.on('routesfound', function(e) {
        showRouteInstructions(e.routes[0], location);
    });
    
    // Highlight the location
    highlightLocation(location);
    
    // Announce to screen readers
    announceToScreenReader(`Calculando rota para ${location.name}`);
    
    // Make sure user position tracking is active
    if (userWatchId === null) {
        startTrackingUserPosition();
    }
}

// Show route instructions
function showRouteInstructions(route, location) {
    const routeInstructions = document.getElementById('route-instructions');
    const routeSteps = document.getElementById('route-steps');
    
    // Clear previous instructions
    routeSteps.innerHTML = '';
    
    // Add each instruction
    route.instructions.forEach(instruction => {
        const step = document.createElement('div');
        step.className = 'route-step';
        
        // Get appropriate icon for this instruction
        let iconClass = 'fas fa-arrow-right';
        if (instruction.type.includes('left')) {
            iconClass = 'fas fa-arrow-left';
        } else if (instruction.type.includes('right')) {
            iconClass = 'fas fa-arrow-right';
        } else if (instruction.type.includes('straight')) {
            iconClass = 'fas fa-arrow-up';
        } else if (instruction.type.includes('destination')) {
            iconClass = 'fas fa-flag-checkered';
        } else if (instruction.type.includes('roundabout')) {
            iconClass = 'fas fa-sync';
        }
        
        step.innerHTML = `
            <div class="route-step-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="route-step-text">
                ${instruction.text}
            </div>
            <div class="route-step-distance">
                ${instruction.distance ? (instruction.distance < 1000 ? 
                    Math.round(instruction.distance) + ' m' : 
                    (instruction.distance / 1000).toFixed(1) + ' km') : ''}
            </div>
        `;
        
        routeSteps.appendChild(step);
    });
    
    // Show the instructions panel
    routeInstructions.style.display = 'block';
    
    // Announce to screen readers
    announceToScreenReader(`Rota para ${location.name} encontrada. ${route.instructions.length} passos.`);
}

// Hide route instructions
function hideRouteInstructions() {
    const routeInstructions = document.getElementById('route-instructions');
    routeInstructions.style.display = 'none';
    
    // Announce to screen readers
    announceToScreenReader('Instruções de rota fechadas');
}

// Get feature name in Portuguese
function getFeatureName(feature) {
    const featureNames = {
        'ramp': 'Rampa',
        'bathroom': 'Banheiro',
        'parking': 'Estacionamento',
        'tactile': 'Piso Tátil',
        'braille': 'Braille',
        'libras': 'Libras'
    };
    
    return featureNames[feature] || feature;
}

// Get icon class for a specific feature
function getIconClassForFeature(feature) {
    const iconClasses = {
        'ramp': 'fas fa-wheelchair',
        'bathroom': 'fas fa-toilet',
        'parking': 'fas fa-parking',
        'tactile': 'fas fa-walking',
        'braille': 'fas fa-braille',
        'libras': 'fas fa-sign-language'
    };
    
    return iconClasses[feature] || 'fas fa-universal-access';
}

// Show location details in modal
function showLocationDetails(location) {
    const modal = document.getElementById('location-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDetails = document.getElementById('modal-details');
    const modalImage = document.getElementById('modal-image');
    const modalAccessibility = document.getElementById('modal-accessibility');
    const modalDirections = document.getElementById('modal-directions');
    
    // Set modal content
    modalTitle.textContent = location.name;
    modalDetails.innerHTML = `<p>${location.description}</p><p>${location.details}</p>`;
    
    // Use CSS placeholder for Rampa de Acesso - Praia dos Artistas
    if (location.id === 1 && location.name === "Rampa de Acesso - Praia dos Artistas") {
        modalImage.innerHTML = `
            <div class="placeholder-ramp">
                <div class="placeholder-ramp-content">
                    Rampa de Acesso - Praia dos Artistas
                </div>
            </div>
        `;
    } else {
        // For other locations, use actual images when available
        modalImage.innerHTML = `<img src="${location.image}" alt="${location.name}">`;
    }
    
    // Create accessibility features list
    const featuresList = location.features.map(feature => {
        return `
            <div class="feature-item">
                <i class="${getIconClassForFeature(feature)}"></i>
                <span>${getFeatureName(feature)}</span>
            </div>
        `;
    }).join('');
    
    modalAccessibility.innerHTML = `
        <h3>Recursos de Acessibilidade</h3>
        <div class="features-list">
            ${featuresList}
        </div>
    `;
    
    // Set up directions button
    modalDirections.addEventListener('click', function() {
        // Close the modal
        closeLocationModal();
        
        // Show route to this location
        showRoute(location);
    });
    
    // Show modal
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    
    // Set focus to modal title for screen readers
    modalTitle.focus();
    
    // Close modal when clicking on X
    const closeModal = document.querySelector('.close-modal');
    closeModal.addEventListener('click', function() {
        closeLocationModal();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeLocationModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLocationModal();
        }
    });
    
    // Announce to screen readers
    announceToScreenReader(`Detalhes de ${location.name}`);
}

// Close location modal
function closeLocationModal() {
    const modal = document.getElementById('location-modal');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

// Initialize filters
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');
            
            // Update current filter
            currentFilter = button.getAttribute('data-filter');
            
            // Update map markers and location cards
            loadAccessibilityLocations();
            
            // Announce filter change to screen readers
            const filterName = currentFilter === 'all' ? 'Todos' : getFeatureName(currentFilter);
            announceToScreenReader(`Filtro alterado para ${filterName}`);
        });
    });
}

// Tela de Login/Cadastro Moderna
document.addEventListener('DOMContentLoaded', function() {
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');
  const loginError = document.getElementById('login-error');
  const registerSuccess = document.getElementById('register-success');
  const registerError = document.getElementById('register-error');
  const registerFooter = document.getElementById('register-footer');

  // Alternar para cadastro
  showRegister.addEventListener('click', function() {
    loginForm.style.display = 'none';
    showRegister.parentElement.style.display = 'none';
    registerForm.style.display = 'flex';
    registerFooter.style.display = 'flex';
    loginError.style.display = 'none';
    registerSuccess.style.display = 'none';
    registerError.style.display = 'none';
  });

  // Alternar para login
  showLogin.addEventListener('click', function() {
    loginForm.style.display = 'flex';
    showRegister.parentElement.style.display = 'flex';
    registerForm.style.display = 'none';
    registerFooter.style.display = 'none';
    loginError.style.display = 'none';
    registerSuccess.style.display = 'none';
    registerError.style.display = 'none';
  });

  // Login
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const stored = JSON.parse(localStorage.getItem('users') || '{}');
    if (stored[username] && stored[username] === password) {
      loginModal.style.display = 'none';
      loginModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      loginError.style.display = 'none';
      // Inicialize o site aqui se necessário
    } else {
      loginError.style.display = 'block';
    }
  });

  // Cadastro
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    let stored = JSON.parse(localStorage.getItem('users') || '{}');
    if (stored[username]) {
      registerSuccess.style.display = 'none';
      registerError.style.display = 'block';
    } else {
      stored[username] = password;
      localStorage.setItem('users', JSON.stringify(stored));
      registerSuccess.style.display = 'block';
      registerError.style.display = 'none';
      setTimeout(() => {
        showLogin.click();
      }, 1200);
    }
  });

  // Impede rolagem quando modal está aberto
  if (loginModal.style.display !== 'none') {
    document.body.style.overflow = 'hidden';
  }

  const directionsBtn = document.getElementById('modal-directions');
  let selectedLocation = null; // Defina isso ao abrir o modal de detalhes

  directionsBtn.addEventListener('click', function() {
      if (selectedLocation) {
          showRoute(selectedLocation);
      }
  });

  // Exemplo: ao abrir o modal de detalhes, defina selectedLocation
  function showLocationDetails(location) {
      selectedLocation = location;
      // ...restante do código para mostrar detalhes...
  }
});
