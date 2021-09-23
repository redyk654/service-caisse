import React, { Fragment, useEffect, useState, useRef } from 'react';
import './GestionRecette.css';
import Modal from "react-modal";
import ReactToPrint from 'react-to-print';
import ImprimerRecette from '../ImprimerRecette/ImprimerRecette';

const customStyles1 = {
    content: {
      top: '32%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      background: '#0e771a',
    },
};

export default function GestionRecette(props) {

    const servicesInit = [
        {code: 'PHA', service: 'Pharmacie', recette: 0, pourcentage: 0, recetteRestante: 0},
        {code: 'MA', service: 'Maternité', recette: 0, pourcentage: 0, recetteRestante: 0},
        {code: 'RX', service: 'Radiologie', recette: 0, pourcentage: 0, recetteRestante: 0},
        {code: 'LAB', service: 'Laboratoire', recette: 0, pourcentage: 0, recetteRestante: 0},
        {code: 'ECHO', service: 'Echographie', recette: 0, pourcentage: 0, recetteRestante: 0},
        {code: 'MED', service: 'Médécine', recette: 0, pourcentage: 0, recetteRestante: 0},
        {code: 'CHR', service: 'Petite chirurgie', recette: 0, pourcentage: 0, recetteRestante: 0},
        {code: 'UPEC', service: 'Upec', recette: 0, pourcentage: 0, recetteRestante: 0},
        {code: 'CO', service: 'Consultation', recette: 0, pourcentage: 0, recetteRestante: 0},
    ];

    const componentRef = useRef();

    const [listeComptes, setListeComptes] = useState([]);
    const [services, setServices] = useState(servicesInit);
    const [servicesSauvegarde, setservicesSauvegarde] = useState([]);
    const [recetteTotal, setrecetteTotal] = useState(0);
    const [recetteRestante, setrecetteRestante] = useState(0);
    const [montantRetire, setmontantRetire] = useState(0);
    const [caissier, setCaissier] = useState('');
    const [rerender, setRerender] = useState(false);
    const [modalContenu, setModalContenu] = useState(true);
    const [modalConfirmation, setModalConfirmation] = useState(false);
    const [modalValidation, setmodalValidation] = useState(false);
    const [modalReussi, setModalReussi] = useState(false);
    const [valeur, setValeur] = useState('');
    const [generalite, setGeneralite] = useState(0);
    const [itemPourcentage, setitemPourcentage] = useState('');

    useEffect(() => {
        const req = new XMLHttpRequest();
        req.open('GET', 'http://localhost/backend-cma/recuperer_caissier.php');

        req.addEventListener('load', () => {
            if(req.status >= 200 && req.status < 400) {
                let result = JSON.parse(req.responseText);
                result = result.filter(item => (item.nom_user != props.nomConnecte && item.rol !== "admin" && item.rol !== "regisseur"))
                setListeComptes(result);
            }
        });

        req.send();

    }, [services]);

    useEffect(() => {
        setmontantRetire(recetteTotal - recetteRestante);
    }, [recetteRestante]);

    const afficherRecettes = (e) => {
        setCaissier(e.target.id);
        const d = new Date();
        let i = 0;
        // Requête pour recuperer les recettes par categorie
        services.map(item => {
            setGeneralite(0);
            item.pourcentage = 0;
            const data = new FormData();
            data.append('code', item.code);
            data.append('caissier', e.target.id);

            const req = new XMLHttpRequest();

            if (d.getHours() >= 6 && d.getHours() <= 12) {
                req.open('POST', `http://localhost/backend-cma/gestion_pourcentage.php?moment=nuit`);
                req.send(data);
            } else if (d.getHours() <= 22 && d.getHours() >= 14) {
                req.open('POST', `http://localhost/backend-cma/gestion_pourcentage.php?moment=jour`);
                req.send(data);
            }

            req.addEventListener('load', () => {
                i++;
                const result = JSON.parse(req.responseText).recette;
                item.recette = JSON.parse(req.responseText).recette != null ? result : 0;
                item.recetteRestante = JSON.parse(req.responseText).recette != null ? result : 0;
                if (services.length === i) {
                    // Rerendre le composant pour mettre à jour les états dans la vue
                    setRerender(!rerender)
                    setservicesSauvegarde(services);

                    let recetteT = 0
                    services.map(item => {recetteT += parseInt(item.recette)});
                    setrecetteTotal(recetteT);
                    setrecetteRestante(recetteT);
                    setmontantRetire(0);
                }

            });
        });
    }

    const changerContenuModal = () => {
        return modalContenu ?
        (
            <Fragment>
                <h2 style={{color: '#fff', textAlign: 'center'}}>{itemPourcentage}</h2>
                <div style={{color: '#fff', textAlign: 'center'}}>Entrez le pourcentage</div>
                <div style={{textAlign: 'center'}} className='modal-button'>
                    <input type="text"value={valeur} onChange={(e) => {if (!isNaN(e.target.value)) {setValeur(e.target.value)}}} style={{width: '40%'}} />
                    <button id='confirmer' className='btn-confirmation' style={{width: '15%', height: '3vh', cursor: 'pointer', marginLeft: '5px'}} onClick={appliquerPourcentage}>OK</button>
                </div>
            </Fragment>
        ) : 
        (
            <Fragment>
                <h2 style={{color: '#fff', textAlign: 'center'}}>Généralités</h2>
                <div style={{color: '#fff', textAlign: 'center'}}>Entrez le montant pour les généralités</div>
                <div style={{textAlign: 'center'}} className='modal-button'>
                    <input type="text" value={valeur} onChange={(e) => {if (!isNaN(e.target.value)) {setValeur(e.target.value)}}} style={{width: '40%'}} />
                    <button id='confirmer' className='btn-confirmation' style={{width: '15%', height: '3vh', cursor: 'pointer', marginLeft: '5px'}} onClick={appliquerGeneralite}>OK</button>
                </div>
            </Fragment>
        )
    }

    const appliquerGeneralite = () => {
        // On retire les généralités sur la recette
        if (valeur.length > 0 && !isNaN(valeur)) {
            let recetteT = 0
            services.map(item => {recetteT += parseInt(item.recetteRestante)});
            recetteT -= valeur;
            setrecetteRestante(recetteT);
            setGeneralite(parseInt(valeur));
            // setrecetteRestante((parseInt(recetteTotal) - parseInt(valeur)));
            setValeur('');
            fermerModalConfirmation();
        }
    }

    const appliquerPourcentage = () => {
        // Application du pourcentage sur un service
        if (valeur.length > 0 && !isNaN(valeur)) {
            const item = services.filter(item => (item.service === itemPourcentage));
            item[0].pourcentage = parseInt(valeur);
            item[0].recetteRestante = parseInt(item[0].recette) - parseInt(item[0].recette) * (item[0].pourcentage / 100);

            // On met à jour la recette restante
            let recetteT = 0
            services.map(item => {recetteT += parseInt(item.recetteRestante)});
            recetteT -= generalite;
            setrecetteRestante(recetteT);

            setValeur('');
            fermerModalConfirmation();
        }
        
    }

    const genererId = () => {
        // Fonction pour générer un identifiant unique pour une commande
        return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1) + recetteTotal;

    }

    const enregitrerDetails = (id_recette) => {
        // On enregistre les détails de la recette
        let i = 0
        services.map(item => {
            const data = new FormData();
            data.append('id_recette', id_recette);
            data.append('categorie', item.service);
            data.append('recette', item.recette);
            data.append('pourcentage', item.pourcentage);
            data.append('recette_restante', item.recetteRestante);

            const req = new XMLHttpRequest();
            req.open('POST', 'http://localhost/backend-cma/gestion_pourcentage.php');

            req.addEventListener('load', () => {
                i++
                if (services.length === i) {
                    fermerModaValidation();
                    setModalReussi(true);
                }
            });

            req.send(data);
        })
    }

    const terminer = () => {
        // Enregistrement de la recette et de tous les détails
        document.getElementById('oui').disabled = true;
        const id_recette = genererId();

        const data = new FormData();
        data.append('id_recette', id_recette);
        data.append('recette_total', recetteTotal);
        data.append('generalite', generalite);
        data.append('montant_retire', montantRetire);
        data.append('recette_restante', recetteRestante);
        data.append('caissier', caissier);
        data.append('regisseur', props.nomConnecte);

        const req = new XMLHttpRequest();
        req.open('POST', 'http://localhost/backend-cma/gestion_pourcentage.php');

        req.addEventListener('load', () => {
            if(req.status >= 200 && req.status < 400) {
                enregitrerDetails(id_recette);
            }
        })

        req.send(data);

    }

    const annuler = () => {
        setServices(servicesInit);
        setGeneralite(0);
        setmontantRetire(0);
        setrecetteRestante(0);
        setrecetteTotal(0)
    }

    const fermerModalConfirmation = () => {
        setModalConfirmation(false);
    }

    const fermerModaValidation = () => {
        setmodalValidation(false)
    }

    const fermerModalReussi = () => {
        setModalReussi(false);
        annuler();
    }

    return (
        <div className="gestion-recette">
            <Modal
                isOpen={modalReussi}
                style={customStyles1}
                contentLabel=""
            >
                <div style={{color: '#fff'}}>
                    <h3>Recette enregistré !</h3>
                    <button style={{padding: '5px', cursor: 'pointer'}} onClick={fermerModalReussi}>Fermer</button>
                    <ReactToPrint
                        trigger={() => <button style={{padding: '5px', cursor: 'pointer', marginLeft: '10px'}}>Imprimer</button>}
                        content={() => componentRef.current}
                    />
                </div>
            </Modal>
            <Modal
                isOpen={modalConfirmation}
                onRequestClose={fermerModalConfirmation}
                style={customStyles1}
                contentLabel=""
            >
                {changerContenuModal()}
            </Modal>
            <Modal
                isOpen={modalValidation}
                style={customStyles1}
                contentLabel=""
            >
                <div style={{color: '#fff'}}>
                    <h2>
                        Vous allez valider cette recette voulez-vous continuer ?
                    </h2>
                    <div style={{textAlign: 'center'}}>
                        <button style={{padding: '6px', cursor: 'pointer', margin: '8px'}} onClick={() => setmodalValidation(false)}>NON</button>
                        <button id="oui" style={{padding: '6px', cursor: 'pointer', margin: '8px'}} onClick={terminer}>OUI</button>
                    </div>
                </div>
            </Modal>
            <h1>Gestions des recettes</h1>

            <div className="container-gestion">
                <div className="box-1">
                    <h1>Comptes</h1>
                    <ul>
                        {listeComptes.length > 0 && listeComptes.map(item => (
                        <li id={item.nom_user} onClick={afficherRecettes}>{item.nom_user.toUpperCase()}</li>
                        ))}
                    </ul>
                </div>
                <div className="box-2">
                    <div className="btn-container" style={{textAlign: 'center'}}>
                        <div>généralités: <span style={{fontWeight: '600'}}>{generalite}</span></div>
                        <button onClick={() => {setModalContenu(false); setModalConfirmation(true);}}>Généralités</button>
                    </div>
                    <table>
                        <thead>
                            <th>Services</th>
                            <th>Recette du jour</th>
                            <th>Pourcentage</th>
                            <th>Recette restante</th>
                            <th>Modifier</th>
                        </thead>
                        <tbody>
                            {services.map(item => (
                                <tr>
                                    <td>{item.service}</td>
                                    <td style={{color: '#0e771a', fontWeight: '600'}}>{item.recette}</td>
                                    <td>{item.pourcentage + ' %'}</td>
                                    <td style={{color: '#0e771a', fontWeight: '600'}}>{item.recetteRestante}</td>
                                    <td><button style={{cursor: 'pointer'}} onClick={() => {setModalContenu(true); setModalConfirmation(true); setitemPourcentage(item.service);}}>éditer</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{marginTop: '50px', textAlign: 'center'}}>
                        <div>
                            Recette Total : <span style={{fontWeight: '600'}}>{recetteTotal + ' Fcfa'}</span>
                        </div>
                        <div>
                            Montant retiré : <span style={{fontWeight: '600'}}>{montantRetire + ' Fcfa'}</span>
                        </div>
                        <div>
                            Recette Restante : <span style={{fontWeight: '600'}}>{recetteRestante + ' Fcfa'}</span>
                        </div>
                    </div>
                    <div className="btn-valid-annul" style={{textAlign: 'center', marginTop: '10px',}}>
                        <button onClick={annuler}>Annuler</button>
                        <button onClick={() => {if(caissier.length > 0) {setmodalValidation(true)}}}>Terminer</button>
                    </div>
                </div>
            </div>
            <div style={{display: 'none'}}>
                <ImprimerRecette
                    ref={componentRef}
                    services={services}
                    recetteTotal={recetteRestante}
                />
            </div>
        </div>
    )
}
