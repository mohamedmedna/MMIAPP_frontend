// Script de test pour vérifier le design moderne du dashboard Secrétariat Général
// À exécuter dans la console du navigateur sur la page du dashboard

console.log('🧪 Test du design moderne du dashboard Secrétariat Général...');

// Test 1: Vérification de la page actuelle
console.log('\n📋 Test 1: Vérification de la page actuelle');
console.log('URL actuelle:', window.location.href);
console.log('Page du dashboard Secrétariat Général:', window.location.pathname.includes('secretaire-general'));

// Test 2: Vérification du design moderne Header/Sidebar/Main/Footer
console.log('\n🔍 Test 2: Vérification du design moderne');
console.log('Design attendu (première image):');
console.log('- Header moderne avec logo, navigation et sélecteurs de langue');
console.log('- Sidebar blanche avec avatar utilisateur et navigation');
console.log('- Main content avec design moderne et cartes de statistiques');
console.log('- Footer avec gradient vert-jaune');

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
  console.log('✅ Header moderne (.dashboard-header) présent');
} else {
  console.log('❌ Header moderne manquant');
}

if (sidebar) {
  console.log('✅ Sidebar moderne (.secretaire-general-sidebar) présente');
} else {
  console.log('❌ Sidebar moderne manquante');
}

if (dashboardMain) {
  console.log('✅ Main content moderne (.dashboard-main) présent');
} else {
  console.log('❌ Main content moderne manquant');
}

if (dashboardFooter) {
  console.log('✅ Footer moderne (.dashboard-footer) présent');
} else {
  console.log('❌ Footer moderne manquant');
}

// Test 3: Vérification du header moderne
console.log('\n🔍 Test 3: Vérification du header moderne');
if (dashboardHeader) {
  const headerLeft = dashboardHeader.querySelector('.header-left');
  const headerCenter = dashboardHeader.querySelector('.header-center');
  const headerRight = dashboardHeader.querySelector('.header-right');
  
  if (headerLeft) {
    console.log('✅ Section gauche du header présente');
    
    const logoCircle = headerLeft.querySelector('.logo-circle');
    const logoText = headerLeft.querySelector('.logo-text');
    const logoTitle = headerLeft.querySelector('.logo-title');
    
    if (logoCircle) {
      console.log('✅ Cercle logo présent');
      const logoStyle = window.getComputedStyle(logoCircle);
      if (logoStyle.borderRadius === '50%') {
        console.log('✅ Logo est bien circulaire');
      }
    }
    
    if (logoText && logoText.textContent === 'RS') {
      console.log('✅ Texte logo "RS" présent');
    }
    
    if (logoTitle && logoTitle.textContent.includes('REPUBLIQUE ISLAMIQUE')) {
      console.log('✅ Titre logo présent');
    }
  }
  
  if (headerCenter) {
    console.log('✅ Section centrale du header présente');
    
    const navLinks = headerCenter.querySelectorAll('.nav-link');
    if (navLinks.length >= 4) {
      console.log('✅ Liens de navigation présents:', navLinks.length);
      
      const expectedNavs = ['Portail de l\'industrie', 'Gestion des autorisations', 'PMNE', 'Contact'];
      navLinks.forEach((link, index) => {
        if (expectedNavs[index] && link.textContent.includes(expectedNavs[index])) {
          console.log(`✅ Lien de navigation "${expectedNavs[index]}" présent`);
        }
      });
      
      // Vérification du lien actif
      const activeLink = headerCenter.querySelector('.nav-link.active');
      if (activeLink && activeLink.textContent.includes('Gestion des autorisations')) {
        console.log('✅ Lien "Gestion des autorisations" marqué comme actif');
      }
    }
  }
  
  if (headerRight) {
    console.log('✅ Section droite du header présente');
    
    const languageSelector = headerRight.querySelector('.language-selector');
    const socialIcons = headerRight.querySelector('.social-icons');
    
    if (languageSelector) {
      const langBtns = languageSelector.querySelectorAll('.lang-btn');
      if (langBtns.length >= 3) {
        console.log('✅ Sélecteurs de langue présents:', langBtns.length);
        
        const activeLangBtn = languageSelector.querySelector('.lang-btn.active');
        if (activeLangBtn && activeLangBtn.textContent.includes('FR Français')) {
          console.log('✅ Bouton "FR Français" marqué comme actif');
        }
      }
    }
    
    if (socialIcons) {
      const socialBtns = socialIcons.querySelectorAll('.social-btn');
      if (socialBtns.length >= 3) {
        console.log('✅ Icônes sociales présentes:', socialBtns.length);
      }
    }
  }
  
  // Vérification du gradient vert-jaune
  const headerStyle = window.getComputedStyle(dashboardHeader);
  console.log('Background du header:', headerStyle.background);
  
  if (headerStyle.background.includes('linear-gradient') && 
      (headerStyle.background.includes('28a745') || headerStyle.background.includes('ffc107'))) {
    console.log('✅ Header a le gradient vert-jaune moderne');
  } else {
    console.log('❌ Header n\'a pas le gradient vert-jaune moderne');
  }
} else {
  console.log('❌ Header manquant pour les tests');
}

// Test 4: Vérification de la sidebar moderne
console.log('\n🔍 Test 4: Vérification de la sidebar moderne');
if (sidebar) {
  const sidebarHeader = sidebar.querySelector('.sidebar-header');
  const sidebarNav = sidebar.querySelector('.sidebar-nav');
  
  if (sidebarHeader) {
    const userInfo = sidebarHeader.querySelector('.user-info');
    if (userInfo) {
      const userAvatar = userInfo.querySelector('.user-avatar');
      const userDetails = userInfo.querySelector('.user-details');
      
      if (userAvatar) {
        console.log('✅ Avatar utilisateur présent');
        const avatarStyle = window.getComputedStyle(userAvatar);
        if (avatarStyle.borderRadius === '50%' && avatarStyle.background === 'rgb(40, 167, 69)') {
          console.log('✅ Avatar est circulaire avec fond vert');
        }
      }
      
      if (userDetails) {
        const userName = userDetails.querySelector('h3');
        const userRole = userDetails.querySelector('p');
        
        if (userName && userName.textContent.includes('Secrétaire Général')) {
          console.log('✅ Nom utilisateur présent');
        }
        
        if (userRole && userRole.textContent.includes('RS • SY')) {
          console.log('✅ Rôle utilisateur présent');
        }
      }
    }
  }
  
  if (sidebarNav) {
    const sidebarLinks = sidebar.querySelectorAll('.sidebar-link');
    if (sidebarLinks.length >= 5) { // 4 onglets + logout
      console.log('✅ Liens de navigation présents:', sidebarLinks.length);
      
      const expectedLinks = ['Tableau de bord', 'Demandes à traiter', 'Historique global', 'Notifications', 'Déconnexion'];
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
        
        // Vérification de la barre jaune à droite
        const activeStyle = window.getComputedStyle(activeLink);
        if (activeStyle.position === 'relative') {
          console.log('✅ Lien actif a la position relative pour la barre jaune');
        }
      } else {
        console.log('❌ Aucun lien actif détecté');
      }
      
      // Vérification du bouton déconnexion
      const logoutBtn = sidebar.querySelector('.sidebar-link.logout');
      if (logoutBtn) {
        console.log('✅ Bouton déconnexion présent');
        const logoutStyle = window.getComputedStyle(logoutBtn);
        if (logoutStyle.color === 'rgb(231, 76, 60)' || logoutStyle.background === 'rgb(255, 245, 245)') {
          console.log('✅ Bouton déconnexion a le style rouge correct');
        }
      }
    }
  }
  
  // Vérification du fond blanc
  const sidebarStyle = window.getComputedStyle(sidebar);
  if (sidebarStyle.background === 'rgb(255, 255, 255)') {
    console.log('✅ Sidebar a le fond blanc moderne');
  } else {
    console.log('❌ Sidebar n\'a pas le fond blanc moderne');
  }
} else {
  console.log('❌ Sidebar manquante pour les tests');
}

// Test 5: Vérification du main content moderne
console.log('\n🔍 Test 5: Vérification du main content moderne');
if (dashboardMain) {
  // Vérification des sections avec design moderne
  const sections = dashboardMain.querySelectorAll('.dashboard-overview, .demandes-section, .historique-global-section, .notifications-section');
  if (sections.length > 0) {
    console.log('✅ Sections avec design moderne présentes:', sections.length);
    
    sections.forEach((section, index) => {
      const sectionStyle = window.getComputedStyle(section);
      if (sectionStyle.borderRadius === '12px' && sectionStyle.background === 'rgb(255, 255, 255)') {
        console.log(`✅ Section ${index + 1} a le design moderne (border-radius: 12px, fond blanc)`);
      }
    });
  }
  
  // Vérification des titres avec soulignement
  const sectionHeaders = dashboardMain.querySelectorAll('.section-header');
  if (sectionHeaders.length > 0) {
    console.log('✅ En-têtes de section avec design moderne présents');
    
    sectionHeaders.forEach((header, index) => {
      const title = header.querySelector('.section-title');
      const underline = header.querySelector('.title-underline');
      
      if (title) {
        const titleStyle = window.getComputedStyle(title);
        if (titleStyle.color === 'rgb(142, 68, 173)') { // #8e44ad
          console.log(`✅ Titre de section ${index + 1} a la couleur violette moderne`);
        }
      }
      
      if (underline) {
        const underlineStyle = window.getComputedStyle(underline);
        if (underlineStyle.background === 'rgb(40, 167, 69)' && underlineStyle.height === '4px') {
          console.log(`✅ Soulignement vert présent pour la section ${index + 1}`);
        }
      }
    });
  }
  
  // Vérification des cartes de statistiques modernes
  const statCards = dashboardMain.querySelectorAll('.stat-card');
  if (statCards.length >= 3) {
    console.log('✅ Cartes de statistiques modernes présentes:', statCards.length);
    
    statCards.forEach((card, index) => {
      const statContent = card.querySelector('.stat-content');
      const statIconWrapper = card.querySelector('.stat-icon-wrapper');
      const statInfo = card.querySelector('.stat-info');
      
      if (statContent && statIconWrapper && statInfo) {
        console.log(`✅ Carte de statistique ${index + 1} a la structure moderne`);
        
        // Vérification des bordures colorées
        if (card.classList.contains('green-border') || 
            card.classList.contains('yellow-border') || 
            card.classList.contains('red-border')) {
          console.log(`✅ Carte ${index + 1} a une bordure colorée moderne`);
        }
      }
    });
  }
} else {
  console.log('❌ Main content manquant pour les tests');
}

// Test 6: Vérification du footer moderne
console.log('\n🔍 Test 6: Vérification du footer moderne');
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
    console.log('✅ Footer a le gradient vert-jaune moderne');
  } else {
    console.log('❌ Footer n\'a pas le gradient vert-jaune moderne');
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

// Test 7: Vérification de la structure flexbox moderne
console.log('\n🔍 Test 7: Vérification de la structure flexbox moderne');
if (dashboardLayout) {
  const layoutStyle = window.getComputedStyle(dashboardLayout);
  console.log('Display du layout:', layoutStyle.display);
  console.log('Flex-direction du layout:', layoutStyle.flexDirection);
  
  if (layoutStyle.display === 'flex' && layoutStyle.flexDirection === 'column') {
    console.log('✅ Layout utilise flexbox moderne en colonne');
  } else {
    console.log('❌ Layout n\'utilise pas flexbox moderne en colonne');
  }
}

// Test 8: Vérification des couleurs et du design moderne
console.log('\n🔍 Test 8: Vérification des couleurs et du design moderne');
if (dashboardMain) {
  // Vérification du fond principal
  const mainStyle = window.getComputedStyle(dashboardMain);
  if (mainStyle.background === 'rgb(248, 249, 250)') { // #f8f9fa
    console.log('✅ Main content a le fond gris clair moderne');
  } else {
    console.log('❌ Main content n\'a pas le fond gris clair moderne');
  }
  
  // Vérification des ombres modernes
  const sections = dashboardMain.querySelectorAll('.dashboard-overview, .demandes-section, .historique-global-section, .notifications-section');
  sections.forEach((section, index) => {
    const sectionStyle = window.getComputedStyle(section);
    if (sectionStyle.boxShadow.includes('rgba(0, 0, 0, 0.08)')) {
      console.log(`✅ Section ${index + 1} a l'ombre moderne`);
    }
  });
}

// Test 9: Vérification de la responsivité moderne
console.log('\n🔍 Test 9: Vérification de la responsivité moderne');
const viewportWidth = window.innerWidth;
console.log('Largeur de la fenêtre:', viewportWidth, 'px');

if (viewportWidth <= 768) {
  console.log('📱 Mode mobile détecté - vérification de la responsivité moderne');
  
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
console.log('Vérifiez visuellement que le design correspond EXACTEMENT à la première image:');
console.log('1. ✅ Header: Gradient vert-jaune avec logo circulaire "RS", navigation centrale, sélecteurs de langue et icônes sociales');
console.log('2. ✅ Sidebar: Fond blanc avec avatar vert, informations utilisateur "Secrétaire Général • RS • SY"');
console.log('3. ✅ Navigation: Onglets avec icônes, "Tableau de bord" actif (fond vert), bouton "Déconnexion" rouge en bas');
console.log('4. ✅ Main: Titres violets avec soulignements verts, cartes de statistiques avec bordures colorées');
console.log('5. ✅ Statistiques: Cartes avec icônes colorées (vert, jaune, rouge) et valeurs grandes');
console.log('6. ✅ Footer: Gradient vert-jaune avec copyright centré');
console.log('7. ✅ Design: Bordures arrondies (12px), ombres subtiles, couleurs modernes, espacement généreux');

console.log('\n✅ Tests du design moderne terminés !');
console.log('🔍 Vérifiez visuellement que le design correspond EXACTEMENT à la première image');
console.log('📖 Design attendu: Header moderne avec navigation, Sidebar blanche avec avatar, Main avec design professionnel');
console.log('❌ Design NON attendu: Structure simple, couleurs basiques, layout basique');





