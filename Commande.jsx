import React, { useState, useEffect, useContext, useRef, Fragment } from 'react';
import './Commande.css';
import { ContextChargement } from '../../Context/Chargement';

// Importation des librairies installées
import Modal from 'react-modal';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import ReactToPrint from 'react-to-print';
import Facture from '../Facture/Facture';
// Styles pour les fenêtres modales
const customStyles1 = {
    content: {
      top: '15%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      background: '#0e771a',
    }, 
};

const styleBtnAutre = {
    backgroundColor: '#6d6f94',
    color: '#fff',
    height: '4vh',
    width: '35%',
    marginTop: '5px',
    fontSize: '16px',
    cursor: 'pointer'
}

const stylePatient = {
    marginTop: '5px',
    height: '50vh',
    border: '1px solid gray',
    overflow: 'auto',
    position: 'relative',
    backgroundColor: '#fff'
}

const styleItem = {
    color: '#0e771a', 
    fontWeight: 'bold', 
    width: '100%', 
    cursor: 'pointer',
    padding: '8px', 
    borderBottom: '1px solid #0e771a',
}

const customStyles3 = {
    content: {
      top: '40%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      background: '#0e771a',
      width: '400px',
      height: '75vh'
    }, 
};


const customStyles2 = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        background: '#0e771a',
      },
};

const styleBox = {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '10px',
    padding: '5px',
}

export default function Commande(props) {

    const componentRef = useRef();
    const {chargement, stopChargement, startChargement} = useContext(ContextChargement);

    const autre  = {designation: '', prix: ''};    

    const [listeMedoc, setListeMedoc] = useState([]);
    const [listeMedocSauvegarde, setListeMedocSauvegarde] = useState([]);
    const [qteDesire, setQteDesire] = useState(1);
    const [patient, setpatient] = useState('');
    const [nomPatient, setNomPatient] = useState(false);
    const [autreState, setAutreState] = useState(autre);
    const [medocSelect, setMedoSelect] = useState(false);
    const [medocCommandes, setMedocCommandes] = useState([]);
    const [frais, setFrais] = useState(false);
    const [qtePrixTotal, setQtePrixTotal] = useState({});
    const [option, setoption] = useState('');
    const [reduction, setreduction] = useState(false);
    const [remise, setremise] = useState(false);
    const [valeurReduction, setvaleurReduction] = useState('');
    const [verse, setverse] = useState('');
    const [montantVerse, setmontantVerse] = useState(0);
    const [relicat, setrelicat] = useState(0);
    const [resteaPayer, setresteaPayer] = useState(0);
    const [idFacture, setidFacture] = useState('');
    const [urgence, setUrgence] = useState(false);
    const[actualiserQte, setActualiserQte] = useState(false);
    const [listePatient, setlistePatient] = useState([])
    const [listePatientSauvegarde, setlistePatientSauvegarde] = useState([]);
    const [messageErreur, setMessageErreur] = useState('');
    const [modalConfirmation, setModalConfirmation] = useState(false);
    const [modalPatient, setModalPatient] = useState(false)
    const [modalReussi, setModalReussi] = useState(false);
    const [statePourRerender, setStatePourRerender] = useState(true);

    const {designation, prix} = autreState;


    useEffect(() => {
        startChargement();
        // Récupération des médicaments dans la base via une requête Ajax
        const req = new XMLHttpRequest();
        if (urgence) {
            req.open('GET', 'http://localhost/backend-cma/recuperer_services.php?urgence=oui');
        } else {
            req.open('GET', 'http://localhost/backend-cma/recuperer_services.php');
        }
        req.addEventListener("load", () => {
            if (req.status >= 200 && req.status < 400) { // Le serveur a réussi à traiter la requête
                const result = JSON.parse(req.responseText);

                // Mise à jour de la liste de médicament et sauvegarde de la même liste pour la gestion du filtrage de médicament
                setListeMedoc(result);
                setListeMedocSauvegarde(result);
                stopChargement();

            } else {
                // Affichage des informations sur l'échec du traitement de la requête
                console.error(req.status + " " + req.statusText);
            }
        });
        req.addEventListener("error", function () {
            // La requête n'a pas réussi à atteindre le serveur
            console.error("Erreur réseau");
        });

        req.send();
    }, [actualiserQte, qtePrixTotal, urgence]);

    useEffect(() => {
        /* Hook exécuter lors de la mise à jour de la liste de médicaments commandés,
           L'exécution du hook va permettre d'actualier les prix et les quantités
        */

        /*
         ***IMPORTANT*** : Il y a un bug non résolu qui fais que lors de la suppression d'un médicament de la liste des commandes,
         les prix et quantités ne sont pas mis à jour correctement
         */
        if (medocSelect || designation.length > 0 && prix.length > 0) {
            let prixTotal = 0;
            medocCommandes.map(item => {
                prixTotal += parseInt(item.prix);
            });

            if (frais) {
                prixTotal += 500;
            }
            
            // prixTotal += medocSelect[0].prix_total;
            
            Object.defineProperty(qtePrixTotal, 'prix_total', {
                value: prixTotal,
                configurable: true,
                enumerable: true,
            });

            Object.defineProperty(qtePrixTotal, 'a_payer', {
                value: prixTotal,
                configurable: true,
                enumerable: true,
            });

            setStatePourRerender(!statePourRerender); // état modifié pour rerendre le composant
        }

    }, [medocCommandes, frais]);

    useEffect(() => {
        // Pour mettre à jour le relicat et le reste à payer
        if (montantVerse >= parseInt(qtePrixTotal.a_payer)) {
            setrelicat(montantVerse - parseInt(qtePrixTotal.a_payer));
            setresteaPayer(0);
        } else {
            if (montantVerse < parseInt(qtePrixTotal.a_payer)) {
                setresteaPayer(parseInt(qtePrixTotal.a_payer) - montantVerse);
                setrelicat(0);
            }
        }

    }, [montantVerse, medocCommandes, frais]);

    // permet de récolter les informations sur le médicament sélectioné
    const afficherInfos = (e) => {

        const d = new Date();

        // Etat d'urgence entre 15h30 et 17h 
        if ( d.getHours() >= 15 && d.getHours() <= 17 && d.getMinutes() >= 30 || (d.getDay() === 0 || d.getDay() === 6) ) {
            setUrgence(true);
        } else {
            setUrgence(false);
        }

        const medocSelectionne = listeMedoc.filter(item => (item.id == e.target.value));
        setMedoSelect(medocSelectionne);
        setQteDesire(1);
    }

    // Filtrage de la liste de médicaments affichés lors de la recherche d'un médicament
    const filtrerListe = (e) => {
        const medocFilter = listeMedocSauvegarde.filter(item => (item.designation.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1));
        setListeMedoc(medocFilter);
    }

    // Enregistrement d'un médicament dans la commande
    const ajouterMedoc = () => {
        /* 
            - Mise à jour de la quantité du médicament commandé dans la liste des commandes
            - Mise à jour du prix total du médicament commandé

            - Mise à jour du nombre total de médicaments commandés
            - Mise à jour de la quantité total des médicaments commandés
            - Mise à jour du prix total de la commande
        */
        if (qteDesire && !isNaN(qteDesire) && medocSelect) {

            setMessageErreur('');
            
            medocSelect[0].reduction = false;

            setMedocCommandes([...medocCommandes, medocSelect[0]]);
            
            setQteDesire('');
        }
        setQteDesire(1);
    }

    const fraisMateriel = () => {
        // +500 des frais de matériel
        setFrais(true);
    }

    const annulerCommande = () => {
        setMedocCommandes([]);
        setQtePrixTotal({});
        setNomPatient('');
        setpatient('');
        setmontantVerse('')
        setrelicat(0);
        setremise(0);
        setMessageErreur('');
        setresteaPayer(0);
        setverse('');
        setFrais(false);
    }

    const sauvegarder = () => {
        const req = new XMLHttpRequest();
        req.open('POST', 'http://192.168.1.12/backend-cma/backup.php');
        req.send();
    }

    const idUnique = () => {
        // Création d'un identifiant unique pour la facture
        const d = new Date()
        const jour = d.getDate().toString() + d.getMonth().toString() + d.getFullYear().toString() + Math.random().toString().replace('.', '1');
        
        const heure = d.getSeconds().toString() + d.getHours().toString() + d.getMinutes().toString();

        return jour + heure;        
    }

    const enregisterFacture = (id) => {

        // Enregistrement de la facture


        const data = new FormData();

        data.append('id', id);
        data.append('caissier', props.nomConnecte);
        nomPatient && data.append('patient', nomPatient);
        data.append('prix_total', qtePrixTotal.prix_total);
        data.append('remise', remise);
        data.append('a_payer', qtePrixTotal.a_payer);
        data.append('montant_verse', montantVerse);
        data.append('relicat', relicat);
        data.append('reste_a_payer', resteaPayer);

        const req = new XMLHttpRequest();
        req.open('POST', 'http://localhost/backend-cma/gestion_factures.php');

        req.addEventListener('load', () => {
            setActualiserQte(!actualiserQte);
            setMedoSelect(false);
            setMessageErreur('');
            setFrais(false);
            // Activation de la fenêtre modale qui indique la réussite de la commmande
            setModalReussi(true);
            // Désactivation de la fenêtre modale de confirmation
            fermerModalConfirmation();
        });

        req.send(data);

    }

    const enregisterPatient = () => {
        // On enregistre le patient dans la base de donnés s'il n'y est pas encore
        if (nomPatient) {

            const patient = listePatientSauvegarde.filter(item => (item.nom.toLowerCase().indexOf(nomPatient.toLowerCase()) !== -1));
            if(patient.length === 0) {
                const data = new FormData();
                data.append('nom_patient', nomPatient);
                
                const req = new XMLHttpRequest();
                req.open('POST', 'http://localhost/backend-cma/gestion_patients.php');
    
                req.send(data);
            }
        }
    }

    const nouveauService = (item) => {
        if (item.designation === designation) {
            const data = new FormData()

            data.append('designation', designation);
            data.append('prix', prix);

            const req = new XMLHttpRequest();
            req.open('POST', 'http://localhost/backend-cma/nouveau_service.php');

            req.addEventListener('load', () => {
                if (req.status >= 200 && req.status < 400) {
                    setAutreState({designation: '', prix: ''})
                }
            });

            req.send(data)
        }
    }

    const validerCommande = () => {

        /* 
            Organisation des données qui seront envoyés au serveur :
                - pour la mise à jour des stocks de médicaments
                - pour la mise à jour de l'historique des commandes
        */
       if(medocCommandes.length > 0) {

            const id = idUnique();
            setidFacture(id);
            let i = 0;
            document.querySelector('.valider').disabled = true;

            medocCommandes.map(item => {

                const data2 = new FormData();
                nomPatient && data2.append('patient', nomPatient);
                data2.append('id_facture', id);
                data2.append('designation', item.designation);
                data2.append('prix_total', item.prix);
                data2.append('caissier', props.nomConnecte);

                // Envoi des données
                const req2 = new XMLHttpRequest();
                req2.open('POST', 'http://localhost/backend-cma/maj_historique_service.php');
                
                // Une fois la requête charger on vide tout les états
                req2.addEventListener('load', () => {
                    if (req2.status >= 200 && req2.status < 400) {
                        nouveauService(item);
                        i++;
                        if (medocCommandes.length === i) {
                            // Toutes les données ont été envoyées

                            enregisterFacture(id);
                            enregisterPatient();
                        }
                    }
                });
                req2.send(data2);
            })
        }
    }

    const appliquerReduction = (e) => {
        // Gestion des reduction sur un service

        if (e.target.textContent === "reduction") {
            setreduction(true);
        } else if (e.target.textContent === "appliquer") {
            
            if (!isNaN(valeurReduction) && valeurReduction > 0) {
                // On applique la reduction en mettant à jour le prix total

                Object.defineProperty(qtePrixTotal, 'a_payer', {
                    value: qtePrixTotal.prix_total - (qtePrixTotal.prix_total * (parseInt(valeurReduction) / 100)),
                    configurable: true,
                    enumerable: true,
                });

                setremise(valeurReduction);

                setvaleurReduction('');
                setreduction(false);
            }
        }
    }

    const handleClick = (e) => {
        if (medocCommandes.length > 0) {
            setmontantVerse(verse);
            setverse('');
        }
    }

    const ajouterPatient = () => {
        setNomPatient(patient);
        setpatient('');
        fermerModalPatient();
        enregisterPatient();
        setMessageErreur('')
    }

    const demanderConfirmation = () => {
        if (medocCommandes.length > 0) {
            if (nomPatient) {
                setMessageErreur('');
                setModalConfirmation(true);
            } else {
                setMessageErreur('Entrez le nom et le prénom du patient');
            }
        }
    }

    const infosPatient = () => {

        // Affiche la fenêtre des informations du patient
        setoption('patient');
        setModalPatient(true);

        const req = new XMLHttpRequest();
        req.open('GET', 'http://localhost/backend-cma/gestion_patients.php');

        req.addEventListener('load', () => {
            const result = JSON.parse(req.responseText);
            setlistePatient(result);
            setlistePatientSauvegarde(result);
        })

        req.send();
    }

    const autreService = () => {
        setoption('autre');
        setModalPatient(true);
    }

    const handleChange = (e) => {
        setAutreState({...autreState, [e.target.name]: e.target.value});
    }

    const contenuModal = () => {
        if (option === 'patient') {
            return (
                <Fragment>
                    <h2 style={{color: '#fff'}}>informations du patient</h2>
                    <div className="detail-item">
                        <div style={{display: 'flex', flexDirection: 'column' , width: '100%', marginTop: 10, color: '#f1f1f1'}}>
                            <label htmlFor="" style={{display: 'block',}}>Nom et prénom</label>
                            <div>
                                <input type="text" name="qteDesire" style={{width: '250px', height: '4vh'}} value={patient} onChange={filtrerPatient} autoComplete='off' />
                                <button style={{cursor: 'pointer', width: '45px', height: '4vh', marginLeft: '5px'}} onClick={ajouterPatient}>OK</button>
                            </div>
                            <div style={{marginTop: '10px'}}>
                                <h2>Liste des patients</h2>
                                <ul style={stylePatient}>
                                    {listePatient.length > 0 && listePatient.map(item => (
                                        <li style={styleItem} onClick={selectionnePatient} id={item.nom}>{item.nom.toUpperCase()}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </Fragment>
            )
        } else if (option === 'autre') {
            return (
                <Fragment>
                    <h2 style={{color: '#fff', textAlign: 'center'}}>Autre Service</h2>
                    <div style={{color: '#fff'}}>
                        <p style={styleBox}>
                            <label htmlFor="">Désignation</label>
                            <input type="text" value={designation} onChange={handleChange} name='designation' autoComplete='off' />
                        </p>
                        <p style={styleBox}>
                            <label htmlFor="">Prix</label>
                            <input type="text" value={prix} onChange={handleChange} name='prix' autoComplete='off' />
                        </p>
                        <p style={styleBox}>
                            <button style={{width: '20%', cursor: 'pointer'}} onClick={ajouterService}>OK</button>
                        </p>
                    </div>
                </Fragment>
            )
        }
    }

    const ajouterService = () => {
        if (designation.length > 0 && prix.length > 0) {
            autreState.id = Math.random().toString();
            setMedocCommandes([...medocCommandes, autreState])
            fermerModalPatient();
        }
    }

    const filtrerPatient = (e) => {
        setpatient(e.target.value);

        setlistePatient(listePatientSauvegarde.filter(item => (item.nom.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1)))
    }

    const selectionnePatient = (e) => {
        setpatient(e.target.id)
    }
    
    const fermerModalPatient = () => {
        setModalPatient(false);
        setpatient('');
    }

    const fermerModalConfirmation = () => {
        setModalConfirmation(false);
    }

    const fermerModalReussi = () => {
        setModalReussi(false);
        sauvegarder();
        setNomPatient('');
        setMedocCommandes([]);
        annulerCommande();
    }

    return (
        <section className="commande">
            <Modal
                isOpen={modalPatient}
                style={customStyles3}
                contentLabel="validation commande"
                ariaHideApp={false}
                onRequestClose={fermerModalPatient}
            >
                {contenuModal()}
            </Modal>
            <Modal
                isOpen={modalConfirmation}
                style={customStyles1}
                contentLabel="validation commande"
            >
                <h2 style={{color: '#fff'}}>êtes-vous sûr de vouloir valider cette facture ?</h2>
                <div style={{textAlign: 'center'}} className='modal-button'>
                    <button  style={{width: '20%', height: '5vh', cursor: 'pointer', marginRight: '10px'}} onClick={fermerModalConfirmation}>Annuler</button>
                    <button className="valider" style={{width: '20%', height: '5vh', cursor: 'pointer'}} onClick={validerCommande}>Confirmer</button>
                </div>
            </Modal>
            <Modal
                isOpen={modalReussi}
                style={customStyles2}
                contentLabel="Commande réussie"
            >
                <h2 style={{color: '#fff'}}>Service effectué !</h2>
                <button style={{width: '20%', height: '5vh', cursor: 'pointer', marginRight: '15px', fontSize: 'large'}} onClick={fermerModalReussi}>ok</button>
                <ReactToPrint
                    trigger={() => <button style={{color: '#303031', height: '5vh', width: '7vw', cursor: 'pointer', fontSize: 'large', fontWeight: '600'}}>Imprimer</button>}
                    content={() => componentRef.current}
                />
            </Modal>
            <div className="left-side">

                <p className="search-zone">
                    <input type="text" placeholder="recherchez un service" onChange={filtrerListe} autoComplete='off' />
                </p>
                <div>
                    <button style={styleBtnAutre} onClick={autreService}>Autres services</button>
                </div>

                <div className="liste-medoc">
                    <h1>Services médicaux</h1>
                    <ul>
                        {chargement ? <div className="loader"><Loader type="Circles" color="#0e771a" height={100} width={100}/></div> : listeMedoc.map(item => (
                            <li value={item.id} key={item.id} onClick={afficherInfos} style={{color: `${parseInt(item.en_stock) < parseInt(item.min_rec) ? 'red' : ''}`}}>{item.designation}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="right-side">
                <h1>{medocSelect ? "Détails du service" : "Selectionnez un service pour voir les détails"}</h1>

                <div className="infos-medoc">
                    {medocSelect && medocSelect.map(item => (
                        <div className="service">
                            <div>
                                <p>Designation</p>
                                <p style={{fontWeight: '700'}}>{item.designation}</p>
                            </div>
                            <div style={{paddingTop: 10}}>
                                <p>Prix</p>
                                <p style={{fontWeight: '700'}}>{item.prix + ' Fcfa'}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="box" style={{marginLeft: 5}}>
                    <div className="detail-item">
                        <button style={{backgroundColor: '#6d6f94'}} onClick={ajouterMedoc}>ajouter</button>
                        <button style={{backgroundColor: '#6d6f94', marginLeft: '5px'}} onClick={fraisMateriel}>+500</button>
                    </div>
                    <div style={{textAlign: 'center'}}>
                        <button style={{backgroundColor: '#6d6f94', width: '30%'}} onClick={infosPatient}>Infos du patient</button>
                    </div>
                    <div>
                        <div>
                            <input type="text" name="reduction" value={valeurReduction} onChange={(e) => {setvaleurReduction(e.target.value)}} autoComplete='off' style={{display: reduction ? 'inline-block' : 'none'}} />
                            <button onClick={appliquerReduction} style={{backgroundColor: '#6d6f94'}}>{reduction ? 'appliquer' : 'reduction'}</button>
                        </div>
                    </div>
                    <div style={{textAlign: 'center'}}>
                        {nomPatient ? (
                            <div>
                                Nom et prénom: <span style={{color: '#0e771a', fontWeight: '700'}}>{nomPatient.toLocaleUpperCase()}</span>
                            </div>
                        ) : null}
                        <label htmlFor="">Montant versé : </label>
                        <input type="text" name='verse' value={verse} onChange={(e) => !isNaN(e.target.value) && setverse(e.target.value)} autoComplete='off' />
                        <button onClick={handleClick} style={{width: '5%'}}>ok</button>
                    </div>
                </div>

                <div className='erreur-message'>{messageErreur}</div>

                <div className="details-commande">
                    <h1>Services sélectionnés</h1>

                    <table>
                        <thead>
                            <tr>
                                <td>Désignation</td>
                                <td>Prix</td>
                            </tr>
                        </thead>
                        <tbody>
                            {medocCommandes.map(item => (
                                <tr key={item.id}>
                                    <td>{item.designation}</td>
                                    <td>{item.prix + ' Fcfa' }</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="valider-annuler">
                        <div className="totaux">
                            <div>
                                Prix total : <span style={{color: "#0e771a", fontWeight: "600"}}>{medocCommandes.length > 0 ? qtePrixTotal.prix_total + ' Fcfa': 0 + ' Fcfa'}</span>
                            </div>
                            <div>
                                Réduction : <span style={{color: "#0e771a", fontWeight: "600"}}>{remise ? remise + '%' : 0 + '%'}</span>
                            </div>
                            <div>
                                Net à payer : <span style={{color: "#0e771a", fontWeight: "600"}}>{qtePrixTotal.a_payer ? qtePrixTotal.a_payer + ' Fcfa': 0 + ' Fcfa'}</span>
                            </div>
                            <div>
                                Montant versé : <span style={{color: "#0e771a", fontWeight: "600"}}>{montantVerse > 0 ? montantVerse + ' Fcfa': 0 + ' Fcfa'}</span>
                            </div>
                            <div>
                                Relicat : <span style={{color: "#0e771a", fontWeight: "600"}}>{relicat > 0 ? relicat + ' Fcfa': 0 + ' Fcfa'}</span>
                            </div>
                            <div>
                                Reste à payer : <span style={{color: "#0e771a", fontWeight: "600"}}>{resteaPayer > 0 ? resteaPayer + ' Fcfa': 0 + ' Fcfa'}</span>
                            </div>
                        </div>
                        <button onClick={annulerCommande}>Annnuler</button>
                        <button onClick={demanderConfirmation}>Valider</button>

                    </div>

                    <div>
                        <div style={{display: 'none'}}>
                            <Facture 
                                ref={componentRef}
                                medocCommandes={medocCommandes}
                                idFacture={idFacture}
                                patient={nomPatient}
                                prixTotal={qtePrixTotal.prix_total}
                                reduction={reduction}
                                aPayer={qtePrixTotal.a_payer}
                                montantVerse={montantVerse}
                                relicat={relicat}
                                resteaPayer={resteaPayer}
                                nomConnecte={props.nomConnecte}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
