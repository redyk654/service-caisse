import React, { useState, useEffect, useContext, useRef } from 'react';
import './Commande.css';
import DetailsMedoc from './DetailsMedoc';
import AfficherProd from '../AfficherProd/AfficherProd';
import { ContextChargement } from '../../Context/Chargement';

// Importation des librairies installées
import Modal from 'react-modal';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import ReactToPrint from 'react-to-print';
import Facture from '../Facture/Facture';
// Styles pour las fenêtres modales
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

export default function Commande(props) {

    const componentRef = useRef();
    const {chargement, stopChargement, startChargement} = useContext(ContextChargement);

    const [listeMedoc, setListeMedoc] = useState([]);
    const [listeMedocSauvegarde, setListeMedocSauvegarde] = useState([]);
    const [qteDesire, setQteDesire] = useState(1);
    const [patient, setpatient] = useState('');
    const [nomPatient, setNomPatient] = useState(false);
    const [medocSelect, setMedoSelect] = useState(false);
    const [medocCommandes, setMedocCommandes] = useState([]);
    const [qtePrixTotal, setQtePrixTotal] = useState({});
    const [reduction, setreduction] = useState(false);
    const [valeurReduction, setvaleurReduction] = useState('')
    const[actualiserQte, setActualiserQte] = useState(false);
    const [messageErreur, setMessageErreur] = useState('');
    const [modalConfirmation, setModalConfirmation] = useState(false);
    const [modalReussi, setModalReussi] = useState(false);
    const [statePourRerender, setStatePourRerender] = useState(true);

    useEffect(() => {
        startChargement();
        // Récupération des médicaments dans la base via une requête Ajax
        const req = new XMLHttpRequest()
        req.open('GET', 'http://localhost/backend-cma/recuperer_services.php');
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
    }, [actualiserQte, qtePrixTotal])

    useEffect(() => {
        /* Hook exécuter lors de la mise à jour de la liste de médicaments commandés,
           L'exécution du hook va permettre d'actualier les prix et les quantités
        */

        /*
         ***IMPORTANT*** : Il y a un bug non résolu qui fais que lors de la suppression d'un médicament de la liste des commandes,
         les prix et quantités ne sont pas mis à jour correctement
         */
        if (medocSelect) {
            let prixTotal = 0;
            medocCommandes.map(item => {
                prixTotal += item.prix_total;
            });
            
            // prixTotal += medocSelect[0].prix_total;
            
            Object.defineProperty(qtePrixTotal, 'prix_total', {
                value: prixTotal,
                configurable: true,
                enumerable: true,
            });

            setStatePourRerender(!statePourRerender); // état modifié pour rerendre le composant
        }

    }, [medocCommandes]);

    // permet de récolter les informations sur le médicament sélectioné
    const afficherInfos = (e) => {
        const medocSelectionne = listeMedoc.filter(item => (item.id == e.target.value));
        setMedoSelect(medocSelectionne);
        setQteDesire(1)
    }

    // Filtrage de la liste de médicaments affichés lors de la recherche d'un médicament
    const filtrerListe = (e) => {
        const medocFilter = listeMedocSauvegarde.filter(item => (item.designation.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1))
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

            if (parseInt(qteDesire) > medocSelect[0].en_stock) {
                setMessageErreur('La quantité commandé ne peut pas être supérieure au stock');
            } else if (medocSelect[0].en_stock == 0) {
                setMessageErreur('Le stock de' + medocSelect[0].designation + ' est épuisé');
            } else {

                setMessageErreur('');

                Object.defineProperty(medocSelect[0], 'prix_total', {
                    value: parseInt(medocSelect[0].prix) * parseInt(qteDesire),
                    configurable: true,
                    enumerable: true
                });
                
                medocSelect[0].reduction = false;

                // Utilisation d'une variable intermédiare pour empêcher les doublons dans les commandes
                let varIntermediaire = medocCommandes.filter(item => (item.id !== medocSelect[0].id));
                setMedocCommandes([...varIntermediaire, medocSelect[0]]);
                
                setQteDesire('');
            }
        } else {
            setMessageErreur("La quantité désiré est manquante ou n'est pas un nombre");
        }
        setQteDesire(1)
    }

    const removeMedoc = (id) => {

        /**
         * Fonctionnalité abandonné à cause d'un bug: c'était pour retirer
         * un médicament de la liste des médicaments commandés
         */
        const varIntermediaire = medocCommandes.filter(item => (item.id !== id));
        setMedocCommandes([...varIntermediaire]);
    }

    const annulerCommande = () => {
        setMedocCommandes([]);
        setQtePrixTotal({});
    }

    const sauvegarder = () => {
        const req = new XMLHttpRequest();
        req.open('POST', 'http://192.168.1.12/backend-cma/backup.php');
        req.send();
    }


    const validerCommande = () => {

        /* 
            Organisation des données qui seront envoyés au serveur :
                - pour la mise à jour des stocks de médicaments
                - pour la mise à jour de l'historique des commandes
        */
        
        if(medocCommandes.length > 0) {

            document.querySelector('.valider').disabled = true;
            
            console.log(medocCommandes);

            medocCommandes.map(item => {

                const data2 = new FormData();
                item.reduction && data2.append('reduction', item.reduction);
                nomPatient && data2.append('patient', nomPatient);
                data2.append('designation', item.designation);
                data2.append('prix_total', item.prix_total);
                data2.append('caissier', props.nomConnecte);

                // Envoi des données
                const req2 = new XMLHttpRequest();
                req2.open('POST', 'http://localhost/backend-cma/maj_historique_service.php');
                
                // Une fois la requête charger on vide tout les états
                req2.addEventListener('load', () => {
                    if (req2.status >= 200 && req2.status < 400) {
                        // setMedocCommandes([]);
                        setActualiserQte(!actualiserQte);
                        setMedoSelect(false); // état modifié pour permettre l'execution du premier useEffect
                        setMessageErreur('');
                        // Activation de la fenêtre modale qui indique la réussite de la commmande
                        setModalReussi(true);
                        // Désactivation de la fenêtre modale de confirmation
                        setModalConfirmation(false);
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

                // On applique la reduction en mettant 1a jour les prix
                medocCommandes.map(item => {
                    if (item.designation === medocSelect[0].designation) {
                        Object.defineProperty(item, 'prix_total', {
                            value: item.prix_total - (item.prix_total * (parseInt(valeurReduction) / 100)),
                            configurable: true,
                            enumerable: true,
                        });

                        item.reduction = valeurReduction;

                        let prixTotal = 0;
                        medocCommandes.map(item => {
                            prixTotal += item.prix_total;
                        });

                        Object.defineProperty(qtePrixTotal, 'prix_total', {
                            value: prixTotal,
                            configurable: true,
                            enumerable: true,
                        });
                    }
                });

                setvaleurReduction('');
                setreduction(false);
            }
        }
    }

    const ajouterPatient = () => {
        setNomPatient(patient);
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
    }

    return (
        <section className="commande">
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
                    <input type="text" placeholder="recherchez un produit" onChange={filtrerListe} />
                </p>

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
                        <input type="text" name="qteDesire" value={qteDesire} onChange={(e) => {setQteDesire(e.target.value)}} autoComplete='off' />
                        <button onClick={ajouterMedoc}>ajouter</button>
                    </div>
                    <div>
                        <input type="text" name="reduction" value={valeurReduction} onChange={(e) => {setvaleurReduction(e.target.value)}} autoComplete='off' style={{display: reduction ? 'inline-block' : 'none'}} />
                        <button onClick={appliquerReduction}>{reduction ? 'appliquer' : 'reduction'}</button>
                    </div>
                    <div className="detail-item">
                        <div style={{display: 'flex', flexDirection: 'column' , width: '100%', marginTop: 10}}>
                            <label htmlFor="" style={{display: 'block',}}>nom du patient (optionnel)</label>
                            <div>
                            <input type="text" name="qteDesire" style={{width: 250}} value={patient} onChange={(e) => {setpatient(e.target.value)}} autoComplete='off' />
                            <button onClick={ajouterPatient}>Confimer</button>
                            </div>
                        </div>
                    </div>
                    {nomPatient ? (
                        <div>
                            Nom: <span style={{color: '#0e771a', fontWeight: '700'}}>{nomPatient}</span>
                        </div>
                    ) : null}
                </div>

                <div className='erreur-message'>{messageErreur}</div>

                <div className="details-commande">
                    <h1>Services sélectionnés</h1>

                    <table>
                        <thead>
                            <tr>
                                <td>Services</td>
                                <td>Prix</td>
                            </tr>
                        </thead>
                        <tbody>
                            {medocCommandes.map(item => (
                                <tr key={item.id}>
                                    <td>{item.designation}</td>
                                    <td>{item.prix_total + ' Fcfa' } {item.reduction ? (<span style={{color: '#0e771a', fontWeight: '700'}}>{'(-' + item.reduction + '%)'}</span>) : null}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="valider-annuler">
                        <div className="totaux">
                            Prix total : <span style={{color: "#0e771a", fontWeight: "600"}}>{medocCommandes.length > 0 ? qtePrixTotal.prix_total + ' Fcfa': 0 + ' Fcfa'}</span>
                        </div>
                        <button onClick={annulerCommande}>Annnuler</button>
                        <button onClick={() => { if(medocCommandes.length > 0) {setModalConfirmation(true)}}}>Valider</button>

                    </div>

                    <div>
                        <div style={{display: 'none'}}>
                            <Facture 
                            ref={componentRef}
                            medocCommandes={medocCommandes}
                            prixTotal={qtePrixTotal}
                            nomConnecte={props.nomConnecte}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
