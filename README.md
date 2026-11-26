ArchiSim : simulateur visuel d'ordinateur

ArchiSim montre comment un ordinateur exécute un programme. On écrit un petit programme en assembleur x86-64 (syntaxe NASM), puis on le lance pas à pas : on voit les registres, la mémoire et les bus (adresses, données, contrôle) s'animer à chaque instruction.

Projet d'équipe (5 étudiants) réalisé pour la SAÉ S3.A.01 du BUT Informatique, IUT d'Aix-Marseille (site d'Arles), en méthode Scrum. Projet en cours.
Fonctionnalités

    Registres 64 bits RAX, RBX, RCX, RDX et RIP
    Instructions MOV, ADD, SUB, INC, DEC, MUL
    Mode Pas à pas (chaque étape expliquée en français) et mode Exécuter (vitesse réglable)
    Mémoire de 512 octets en little-endian, animation des bus
    Affichage des valeurs en décimal et en binaire

Mon rôle (Aminata Sita Camara, développeuse)

J'ai développé l'assembleur, le module qui lit le code source tapé par l'utilisateur :

    lecture des sections .data et .text, des instructions et de leurs opérandes
    lecture des nombres dans tous les formats du cours (décimal, hexadécimal 0x0A ou 0Ah, binaire 1010b)
    codage des nombres négatifs en complément à deux sur 64 bits
    refus des lignes mal écrites avec un message clair
    code validé par des tests automatisés (Vitest)

Technologies

    Vue 3 pour l'interface
    JavaScript (BigInt pour calculer exactement sur 64 bits)
    Vite pour le développement et la mise en production
    Vitest pour les tests
    Git (une branche par user story, merge requests) et Trello pour le suivi Scrum

Lancer le projet

Prérequis : Node.js 20.19 ou plus récent.
Équipe

    Mamadou Baillo Barry : Product Owner, développeur
    Aldo Alex Nganji : Scrum Master, développeur
    Aminata Sita Camara : développeuse (assembleur)
    Djawad Toure Issahou : développeur
    Mariem Abdelkerim : développeuse

Enseignant commanditaire : M. Ricardo Uribe Lobello.

