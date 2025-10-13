// Script de test pour vérifier la nouvelle structure du dashboard Secrétariat Général
// À exécuter dans la console du navigateur sur la page du dashboard

console.log('🧪 Test de la nouvelle structure du dashboard Secrétariat Général...');

// Test 1: Vérification de la page actuelle
console.log('\n📋 Test 1: Vérification de la page actuelle');
console.log('URL actuelle:', window.location.href);
console.log('Page du dashboard Secrétariat Général:', window.location.pathname.includes('secretaire-general'));

// Test 2: Vérification de la nouvelle structure Header/Sidebar/Main/Footer
console.log('\n🔍 Test 2: Vérification de la nouvelle structure');
console.log('Structure attendue (nouvelle version):');
console.log('- Header en haut (gradient vert-jaune)');
console.log('- Sidebar à gauche (navigation)');
console.log('- Main content à droite');
console.log('- Footer en bas (gradient vert-jaune)');

const dashboardLayout = document.querySelector('.dashboard-layout');
const dashboardHeader = document.querySelector('.dashboard-header');
const sidebar = document.querySelector('.secretaire-general-sidebar');
const dashboardMain = document.querySelector('.dashboard-main');
const dashboardFooter = document.querySelector('.dashboard-footer');

if (dashboardLayout) {
  console.log('✅ Container principal (.dashboard-layout) présent');
} else {
  console.log('❌ Container principal manquant');
}

if (dashboardHeader) {
  console.log('✅ Header (.dashboard-header) présent');
} else {
  console.log('❌ Header manquant');
}

if (sidebar) {
  console.log('✅ Sidebar (.secretaire-general-sidebar) présente');
} else {
  console.log('❌ Sidebar manquante');
}

if (dashboardMain) {
  console.log('✅ Main content (.dashboard-main) présent');
} else {
  console.log('❌ Main content manquant');
}

if (dashboardFooter) {
  console.log('✅ Footer (.dashboard-footer) présent');
} else {
  console.log('❌ Footer manquant');
}

// Test 3: Vérification du header
console.log('\n🔍 Test 3: Vérification du header');
if (dashboardHeader) {
  const headerTitle = dashboardHeader.querySelector('.header-title');
  const headerActions = dashboardHeader.querySelector('.header-actions');
  const refreshButton = dashboardHeader.querySelector('.refresh-button');
  
  if (headerTitle) {
    console.log('✅ Titre du header présent:', headerTitle.textContent);
    
    if (headerTitle.textContent.includes('Secrétariat Général')) {
      console.log('✅ Titre correct: "Secrétariat Général - Gestion des Autorisations"');
    } else {
      console.log('❌ Titre incorrect:', headerTitle.textContent);
    }
  }
  
  if (headerActions) {
    console.log('✅ Actions du header présentes');
  } else {
    console.log('❌ Actions du header manquantes');
  }
  
  if (refreshButton) {
    console.log('✅ Bouton "Actualiser" présent');
  } else {
    console.log('❌ Bouton "Actualiser" manquant');
  }
  
  // Vérification du gradient vert-jaune
  const headerStyle = window.getComputedStyle(dashboardHeader);
  console.log('Background du header:', headerStyle.background);
  
  if (headerStyle.background.includes('linear-gradient') && 
      (headerStyle.background.includes('28a745') || headerStyle.background.includes('ffc107'))) {
    console.log('✅ Header a le gradient vert-jaune');
  } else {
    console.log('❌ Header n\'a pas le gradient vert-jaune');
  }
} else {
  console.log('❌ Header manquant pour les tests');
}

// Test 4: Vérification de la sidebar
console.log('\n🔍 Test 4: Vérification de la sidebar');
if (sidebar) {
  const sidebarHeader = sidebar.querySelector('.sidebar-header');
  const sidebarNav = sidebar.querySelector('.sidebar-nav');
  const sidebarLinks = sidebar.querySelectorAll('.sidebar-link');
  
  if (sidebarHeader) {
    const sidebarTitle = sidebarHeader.querySelector('h3');
    const sidebarSubtitle = sidebarHeader.querySelector('p');
    
    if (sidebarTitle) {
      console.log('✅ Titre de la sidebar présent:', sidebarTitle.textContent);
    }
    
    if (sidebarSubtitle) {
      console.log('✅ Sous-titre de la sidebar présent:', sidebarSubtitle.textContent);
    }
  }
  
  if (sidebarNav) {
    console.log('✅ Navigation de la sidebar présente');
  }
  
  if (sidebarLinks.length >= 5) { // 4 onglets + logout
    console.log('✅ Liens de navigation présents:', sidebarLinks.length);
    
    const expectedLinks = ['Tableau de bord', 'Mes demandes', 'Historique', 'Notifications', 'Déconnexion'];
    sidebarLinks.forEach((link, index) => {
      const linkText = link.querySelector('.label')?.textContent;
      if (linkText && expectedLinks[index]) {
        console.log(`✅ Lien ${index + 1}: "${linkText}" (attendu: "${expectedLinks[index]}")`);
      }
    });
    
    // Vérification du lien actif
    const activeLink = sidebar.querySelector('.sidebar-link.active');
    if (activeLink) {
      console.log('✅ Lien actif détecté:', activeLink.querySelector('.label')?.textContent);
    } else {
      console.log('❌ Aucun lien actif détecté');
    }
  } else {
    console.log('❌ Pas assez de liens de navigation');
  }
  
  // Vérification de la position (gauche)
  const sidebarStyle = window.getComputedStyle(sidebar);
  const sidebarRect = sidebar.getBoundingClientRect();
  console.log('Position de la sidebar:', sidebarRect.left, 'px depuis la gauche');
  
  if (sidebarRect.left < 100) {
    console.log('✅ Sidebar positionnée à gauche');
  } else {
    console.log('❌ Sidebar pas positionnée à gauche');
  }
} else {
  console.log('❌ Sidebar manquante pour les tests');
}

// Test 5: Vérification du main content
console.log('\n🔍 Test 5: Vérification du main content');
if (dashboardMain) {
  const mainRect = dashboardMain.getBoundingClientRect();
  const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : null;
  
  console.log('Position du main content:', mainRect.left, 'px depuis la gauche');
  
  if (sidebarRect && mainRect.left > sidebarRect.right) {
    console.log('✅ Main content positionné à droite de la sidebar');
  } else {
    console.log('❌ Main content pas positionné à droite de la sidebar');
  }
  
  // Vérification du contenu
  const sectionTitle = dashboardMain.querySelector('.section-title');
  if (sectionTitle) {
    console.log('✅ Titre de section présent:', sectionTitle.textContent);
  }
  
  const statCards = dashboardMain.querySelectorAll('.stat-card');
  if (statCards.length >= 3) {
    console.log('✅ Cartes de statistiques présentes:', statCards.length);
  }
} else {
  console.log('❌ Main content manquant pour les tests');
}

// Test 6: Vérification du footer
console.log('\n🔍 Test 6: Vérification du footer');
if (dashboardFooter) {
  const footerText = dashboardFooter.querySelector('.footer-text');
  
  if (footerText) {
    console.log('✅ Texte du footer présent:', footerText.textContent);
    
    if (footerText.textContent.includes('Ministère des Mines et de l\'Industrie')) {
      console.log('✅ Copyright correct présent');
    } else {
      console.log('❌ Copyright incorrect ou manquant');
    }
  }
  
  // Vérification du gradient vert-jaune
  const footerStyle = window.getComputedStyle(dashboardFooter);
  console.log('Background du footer:', footerStyle.background);
  
  if (footerStyle.background.includes('linear-gradient') && 
      (footerStyle.background.includes('28a745') || footerStyle.background.includes('ffc107'))) {
    console.log('✅ Footer a le gradient vert-jaune');
  } else {
    console.log('❌ Footer n\'a pas le gradient vert-jaune');
  }
  
  // Vérification du centrage
  if (footerStyle.textAlign === 'center') {
    console.log('✅ Footer centré');
  } else {
    console.log('❌ Footer non centré:', footerStyle.textAlign);
  }
} else {
  console.log('❌ Footer manquant pour les tests');
}

// Test 7: Vérification de la structure flexbox
console.log('\n🔍 Test 7: Vérification de la structure flexbox');
if (dashboardLayout) {
  const layoutStyle = window.getComputedStyle(dashboardLayout);
  console.log('Display du layout:', layoutStyle.display);
  console.log('Flex-direction du layout:', layoutStyle.flexDirection);
  
  if (layoutStyle.display === 'flex' && layoutStyle.flexDirection === 'column') {
    console.log('✅ Layout utilise flexbox en colonne');
  } else {
    console.log('❌ Layout n\'utilise pas flexbox en colonne');
  }
}

if (dashboardContainer) {
  const containerStyle = window.getComputedStyle(dashboardContainer);
  console.log('Display du container:', containerStyle.display);
  
  if (containerStyle.display === 'flex') {
    console.log('✅ Container utilise flexbox');
  } else {
    console.log('❌ Container n\'utilise pas flexbox');
  }
}

// Test 8: Vérification de l'absence de l'ancienne structure
console.log('\n🔍 Test 8: Vérification de l\'absence de l\'ancienne structure');
const oldTabButtons = document.querySelectorAll('button[style*="background: #28a745"]');
const oldNavigation = document.querySelector('div[style*="padding: 24px"][style*="max-width: 1400px"]');

if (oldTabButtons.length === 0) {
  console.log('✅ Anciens boutons de navigation par onglets supprimés (bon)');
} else {
  console.log('❌ Anciens boutons de navigation encore présents:', oldTabButtons.length);
}

if (!oldNavigation) {
  console.log('✅ Ancienne navigation centrée supprimée (bon)');
} else {
  console.log('❌ Ancienne navigation centrée encore présente');
}

// Test 9: Vérification de la responsivité
console.log('\n🔍 Test 9: Vérification de la responsivité');
const viewportWidth = window.innerWidth;
console.log('Largeur de la fenêtre:', viewportWidth, 'px');

if (viewportWidth <= 768) {
  console.log('📱 Mode mobile détecté - vérification de la responsivité');
  
  if (sidebar && dashboardMain) {
    const sidebarStyle = window.getComputedStyle(sidebar);
    const mainStyle = window.getComputedStyle(dashboardMain);
    
    if (sidebarStyle.order === '2' && mainStyle.order === '1') {
      console.log('✅ Ordre mobile correct (main en premier, sidebar en second)');
    } else {
      console.log('❌ Ordre mobile incorrect');
    }
  }
} else {
  console.log('💻 Mode desktop détecté');
}

// Test 10: Instructions de vérification visuelle finale
console.log('\n📝 Test 10: Instructions de vérification visuelle finale');
console.log('Vérifiez visuellement que:');
console.log('1. ✅ Header: Gradient vert-jaune en haut, titre + bouton Actualiser');
console.log('2. ✅ Sidebar: Navigation à gauche avec onglets et bouton Déconnexion');
console.log('3. ✅ Main: Contenu principal à droite avec statistiques et tableaux');
console.log('4. ✅ Footer: Gradient vert-jaune en bas, copyright centré');
console.log('5. ✅ Structure: Header (haut), Sidebar (gauche), Main (droite), Footer (bas)');

console.log('\n✅ Tests de la nouvelle structure terminés !');
console.log('🔍 Vérifiez visuellement que la structure correspond au wireframe');
console.log('📖 Structure attendue: Header (haut), Sidebar (gauche), Main (droite), Footer (bas)');
console.log('❌ Structure NON attendue: Navigation par onglets horizontaux, contenu centré');





