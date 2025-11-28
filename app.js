/**
 * Green Memory - Logique du jeu
 * Eco-conception : Code Vanilla 
 * Accessibilité : Gestion rigoureuse du focus et des annonces ARIA.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DONNÉES DU JEU (Emojis = Assets textuels) 
    const items = [
        { icon: '🌿', name: 'Fougère' },
        { icon: '🍄', name: 'Champignon' },
        { icon: '🦊', name: 'Renard' },
        { icon: '🐝', name: 'Abeille' },
        { icon: '🐞', name: 'Coccinelle' },
        { icon: '🌻', name: 'Tournesol' },
        { icon: '🌲', name: 'Sapin' },
        { icon: '🦋', name: 'Papillon' }
    ];

    // SÉLECTION DU DOM
    const grid = document.getElementById('game-board');
    const moveCounter = document.getElementById('moves');
    const liveRegion = document.getElementById('live-feedback');
    const restartBtn = document.getElementById('restart-btn');
    const gameMessage = document.getElementById('game-message');

    // ÉTAT DU JEU
    let cards = [];
    let flippedCards = []; 
    let matchedPairs = 0;
    let moves = 0;
    let isLocked = false; 

    // ---------------------------------------------------------
    // FONCTIONS UTILITAIRES
    // ---------------------------------------------------------

    // Mélange de Fisher-Yates 
    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // Annonce vocale pour lecteur d'écran
    const announce = (message) => {
        liveRegion.textContent = message;
    };

    // Affiche un message visible à l'écran
    const showMessage = (message, type = '') => {
        gameMessage.textContent = message;
        gameMessage.className = 'game-message' + (type ? ` ${type}` : '');
        gameMessage.hidden = false;
    };

    // Cache le message
    const hideMessage = () => {
        gameMessage.hidden = true;
        gameMessage.textContent = '';
        gameMessage.className = 'game-message';
    };

    // Mise à jour du compteur visuel et accessible
    const updateMoves = () => {
        moves++;
        moveCounter.textContent = `${moves} coups`;
    };

    // ---------------------------------------------------------
    // INITIALISATION DU JEU
    // ---------------------------------------------------------

    const initGame = () => {
        moves = 0;
        matchedPairs = 0;
        flippedCards = [];
        isLocked = false;
        moveCounter.textContent = '0 coups';
        grid.innerHTML = '';
        hideMessage();
        announce("Nouvelle partie commencée. À vous de jouer !");

        cards = shuffle([...items, ...items]);

        cards.forEach((item, index) => {
            const li = document.createElement('li');
            
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.classList.add('card');
            btn.dataset.name = item.name; 
            btn.dataset.index = index;
            
            btn.setAttribute('aria-label', `Carte ${index + 1}, masquée`);

            btn.innerHTML = `
                <div class="card-inner">
                    <span class="card-front" aria-hidden="true">?</span>
                    <span class="card-back" aria-hidden="true">${item.icon}</span>
                </div>
            `;

            btn.addEventListener('click', () => handleCardClick(btn, item));

            li.appendChild(btn);
            grid.appendChild(li);
        });
    };

    // LOGIQUE DU TOUR

    const handleCardClick = (btn, item) => {
        // Bloque si : jeu verrouillé, carte déjà retournée, ou carte déjà trouvée
        if (isLocked || btn.classList.contains('flipped') || btn.classList.contains('matched')) {
            return;
        }

        // Action de retourner
        flipCard(btn, item);

        // Si 2 cartes sont retournées, on vérifie
        if (flippedCards.length === 2) {
            updateMoves();
            checkForMatch();
        }
    };

    const flipCard = (btn, item) => {
        btn.classList.add('flipped');
        // Mise à jour ARIA immédiate : "Carte 1, Renard" 
        btn.setAttribute('aria-label', `Carte ${parseInt(btn.dataset.index) + 1}, ${item.name}`);
        flippedCards.push({ element: btn, name: item.name });
    };

    const checkForMatch = () => {
        isLocked = true; 
        const [card1, card2] = flippedCards;

        // Comparaison
        if (card1.name === card2.name) {
            handleMatch(card1, card2);
        } else {
            handleMismatch(card1, card2);
        }
    };

    // Cas : PAIRE TROUVÉE
    const handleMatch = (card1, card2) => {
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        
        matchedPairs++;
        announce(`Paire trouvée ! ${card1.name}.`); 
        resetTurn();

        if (matchedPairs === items.length) { // 8 paires
            setTimeout(() => {
                const winMessage = `Bravo ! Vous avez gagné en ${moves} coups !`;
                showMessage(winMessage, 'win');
                announce(`${winMessage} Cliquez sur Recommencer pour rejouer.`);
                restartBtn.focus();
            }, 500);
        }
    };

    // Cas : PAS DE CORRESPONDANCE
    const handleMismatch = (card1, card2) => {
        announce(`Pas de correspondance. ${card1.name} et ${card2.name}.`); 
        
        setTimeout(() => {
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
            
            card1.element.setAttribute('aria-label', `Carte ${parseInt(card1.element.dataset.index) + 1}, masquée`);
            card2.element.setAttribute('aria-label', `Carte ${parseInt(card2.element.dataset.index) + 1}, masquée`);
            
            resetTurn();
        }, 1000); 
    };

    const resetTurn = () => {
        flippedCards = [];
        isLocked = false;
    
    };

    // ÉVÉNEMENTS GLOBAUX

    restartBtn.addEventListener('click', initGame);

    initGame();
});