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

    // CONFIGURATION
    const MAX_MOVES = 12; // Limite de coups

    // ÉTAT DU JEU
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let isLocked = false;
    let isGameOver = false; 

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

    // Annonce vocale pour lecteur d'écran (aria-live)
    const announce = (message) => {
        liveRegion.textContent = message;
    };

    // Affiche un message visible ET vocal
    const showFeedback = (message, type = '', isVisual = true) => {
        // Toujours annoncer vocalement
        announce(message);

        // Afficher visuellement si demandé
        if (isVisual) {
            gameMessage.textContent = message;
            gameMessage.className = 'game-message' + (type ? ` ${type}` : '');
            gameMessage.hidden = false;
        }
    };

    // Cache le message visuel
    const hideMessage = () => {
        gameMessage.hidden = true;
        gameMessage.textContent = '';
        gameMessage.className = 'game-message';
    };

    // Mise à jour du compteur visuel et accessible
    const updateMoves = () => {
        moves++;
        const remaining = MAX_MOVES - moves;
        moveCounter.textContent = `${moves}/${MAX_MOVES} coups`;

        // Alerte quand il reste peu de coups
        if (remaining === 5) {
            announce(`Attention, il ne vous reste que 5 coups !`);
        } else if (remaining === 3) {
            announce(`Attention, plus que 3 coups !`);
        } else if (remaining === 1) {
            announce(`Dernier coup !`);
        }
    };

    // Annonce de la progression
    const announceProgress = () => {
        const pairsRemaining = items.length - matchedPairs;
        if (pairsRemaining > 0) {
            const remaining = MAX_MOVES - moves;
            announce(`${matchedPairs} paire${matchedPairs > 1 ? 's' : ''} trouvée${matchedPairs > 1 ? 's' : ''} sur ${items.length}. Il vous reste ${remaining} coup${remaining > 1 ? 's' : ''}.`);
        }
    };

    // ---------------------------------------------------------
    // INITIALISATION DU JEU
    // ---------------------------------------------------------

    const initGame = () => {
        moves = 0;
        matchedPairs = 0;
        flippedCards = [];
        isLocked = false;
        isGameOver = false;
        moveCounter.textContent = `0/${MAX_MOVES} coups`;
        grid.innerHTML = '';
        hideMessage();
        announce("Nouvelle partie commencée. À vous de jouer !");

        cards = shuffle([...items, ...items]);

        const fragment = document.createDocumentFragment();

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
            fragment.appendChild(li);
        });

        grid.appendChild(fragment);
    };

    // LOGIQUE DU TOUR

    const handleCardClick = (btn, item) => {
        // Bloque si : jeu terminé, jeu verrouillé, carte déjà retournée, ou carte déjà trouvée
        if (isGameOver || isLocked || btn.classList.contains('flipped') || btn.classList.contains('matched')) {
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
        btn.setAttribute('aria-label', `Carte ${parseInt(btn.dataset.index, 10) + 1}, ${item.name}`);
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

        // Vérifier si limite de coups atteinte (et pas encore gagné)
        if (moves >= MAX_MOVES && matchedPairs < items.length) {
            handleGameOver();
        }
    };

    // Cas : DÉFAITE (limite de coups atteinte)
    const handleGameOver = () => {
        isGameOver = true;

        // Désactiver les cartes non trouvées pour les technologies d'assistance
        document.querySelectorAll('.card:not(.matched)').forEach(card => {
            card.setAttribute('aria-disabled', 'true');
        });

        setTimeout(() => {
            showFeedback(`Dommage ! Vous avez utilisé vos ${MAX_MOVES} coups.`, 'lose');
            restartBtn.focus();
        }, 1200);
    };

    // Cas : PAIRE TROUVÉE
    const handleMatch = (card1, card2) => {
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');

        matchedPairs++;
        showFeedback(`Paire trouvée !`, 'win');
        resetTurn();

        if (matchedPairs === items.length) { // 8 paires
            isGameOver = true;

            // Toutes les cartes sont trouvées, marquer comme terminé
            document.querySelectorAll('.card').forEach(card => {
                card.setAttribute('aria-disabled', 'true');
            });

            setTimeout(() => {
                showFeedback(`Bravo, vous avez gagné en ${moves} coups !`, 'win');
                restartBtn.focus();
            }, 500);
        } else {
            // Annonce de la progression après un court délai
            setTimeout(() => {
                announceProgress();
            }, 1500);
        }
    };

    // Cas : PAS DE CORRESPONDANCE
    const handleMismatch = (card1, card2) => {
        showFeedback(`Pas de correspondance, essayez encore.`, 'lose');

        setTimeout(() => {
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');

            card1.element.setAttribute('aria-label', `Carte ${parseInt(card1.element.dataset.index, 10) + 1}, masquée`);
            card2.element.setAttribute('aria-label', `Carte ${parseInt(card2.element.dataset.index, 10) + 1}, masquée`);

            hideMessage();
            resetTurn();

            // Repositionner le focus pour les utilisateurs clavier
            card1.element.focus();
        }, 1000);
    };

    const resetTurn = () => {
        flippedCards = [];
        isLocked = false;
    
    };

    // ÉVÉNEMENTS GLOBAUX

    restartBtn.addEventListener('click', initGame);

    initGame();

    // Calcul du poids de la page
    window.addEventListener('load', () => {
        if (window.performance) {
            const resources = performance.getEntriesByType('resource');
            const transferSize = resources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
            const docSize = new Blob([document.documentElement.outerHTML]).size;
            const totalSize = transferSize + docSize;
            const pageWeight = document.getElementById('page-weight');
            if (pageWeight && totalSize > 0) {
                pageWeight.textContent = (totalSize / 1024).toFixed(1) + ' Ko';
            }
        }
    });
});