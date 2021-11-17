import React, { useState, useRef, Fragment } from 'react';
import './Entete.css';
import ImprimerRecette from '../ImprimerRecette/ImprimerRecette';
import ReactToPrint from 'react-to-print';
import Modal from 'react-modal';
import Loader from "react-loader-spinner";

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

export default function Entete(props) {

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

    const utilisateur = {
        ancien: '',
        nouveau: '',
        confirmation: ''
    }

    const [services, setServices] = useState(servicesInit);
    const [recettejour, setRecetteJour] = useState({recette: ''});
    const [recetteTotal, setrecetteTotal] = useState(0);
    const [nouveauMdp, setNouveauMdp] = useState(utilisateur);
    const [modalConfirmation, setModalConfirmation] = useState(false);
    const [msgErreur, setMsgErreur] = useState('');
    const [mdpReussi, setMdpReussi] = useState(false);
    const [modalReussi, setModalReussi] = useState(false);
    const [encours, setenCours] = useState(true);

    const { ancien, nouveau, confirmation } = nouveauMdp;


    const calculRecetteJour = () => {
        // Récupération de la recette en cours du vendeur
        setModalReussi(true);
        setMdpReussi(false);
        const d = new Date();
        let i = 0;

        services.map(item => {
            const data = new FormData();
            data.append('code', item.code);
            data.append('caissier', props.nomConnecte);

            const req = new XMLHttpRequest();

            if (d.getHours() >= 5 && d.getHours() <= 12) {
                req.open('POST', `http://192.168.1.101/backend-cma/gestion_pourcentage.php?moment=nuit`);
                req.send(data);
            } else if (d.getHours() <= 22 && d.getHours() >= 13) {
                req.open('POST', `http://192.168.1.101/backend-cma/gestion_pourcentage.php?moment=jour`);
                req.send(data);
            } else {
                deconnection();
            }

            req.addEventListener('load', () => {
                i++;
                const result = JSON.parse(req.responseText).recette;
                item.recette = JSON.parse(req.responseText).recette != null ? result : 0;
                item.recetteRestante = JSON.parse(req.responseText).recette != null ? result : 0;
                if (services.length === i) {
                    let recetteT = 0;
                    services.map(item => {recetteT += parseInt(item.recette)});
                    setrecetteTotal(recetteT);
                    setenCours(false);
                }

            });
        });
    }

    const enregisterRecette = () => {
        // Enreistrement de la recette dans la base de données
        const data = new FormData();
        data.append('nom', props.nomConnecte);
        data.append('ancien', ancien);
        data.append('montant', recettejour.recette);

        const req = new XMLHttpRequest();
        req.open('POST', 'http://192.168.1.101/backend-cma/gestion_recette.php');

        req.addEventListener('load', () => {
            if (req.status >= 200 && req.status < 400) {
                deconnection();
            }
        })

        req.send(data);
    }

    const handleChange = (e) => {
        setNouveauMdp({...nouveauMdp, [e.target.name]: e.target.value});
    }

    const modifierMotDePasse = (e) => {
        // Modification du mot de passe

        e.preventDefault();

        if (nouveau.length > 0 && nouveau === confirmation) {
            setMsgErreur('');
            const data = new FormData();
            data.append('nom', props.nomConnecte);
            data.append('ancien', ancien);
            data.append('nouveau', nouveau);

            const req = new XMLHttpRequest();
            req.open('POST', 'http://192.168.1.101/backend-cma/modif_pass_caisse.php');

            req.addEventListener('load', () => {
                if (req.status >= 200 && req.status < 400) {
                    if (req.responseText == "L'ancien mot de passe ne corresppond pas") {
                        setMsgErreur("L'ancien mot de passe ne corresppond pas");
                    } else  {
                        setNouveauMdp(utilisateur);
                        fermerModalConfirmation();
                        setenCours(true);
                        setMdpReussi(true);
                        setModalReussi(true);
                    }
                } else {
                    console.log(req.status + " " + req.statusText);
                }
            });

            req.send(data);

        } else {
            setMsgErreur('Le mot de passe et le mot passe de confirmation doivent être identique')
        }
    }

    const deconnection = () => {
        props.setConnecter(false);
        props.setOnglet(1);
        setModalReussi(false);
    }

    const fermerModalConfirmation = () => {
        setModalConfirmation(false);
        setMsgErreur('');
        setNouveauMdp(utilisateur);
    }

    const fermerModalReussi = () => {
        setModalReussi(false);
    }

    return (
        <header className="entete">
            <Modal
                isOpen={modalReussi}
                style={customStyles2}
                contentLabel="Recette jour"
            >
                {mdpReussi ? '' : <h2 style={{color: '#fff'}}>Imprimez votre fiche de recette du jour</h2>}
                {!encours ? (
                    <Fragment>
                        <ReactToPrint
                            trigger={() => <button style={{color: '#303031', marginRight: '15px', height: '5vh', width: '7vw', cursor: 'pointer', fontSize: 'large', fontWeight: '600'}}>Imprimer</button>}
                            content={() => componentRef.current}
                        />
                        <button style={{width: '20%', height: '5vh', cursor: 'pointer', fontSize: 'large'}} onClick={deconnection}>Fermer</button>
                    </Fragment>) :
                    (   
                        <div className='loader'>
                            {mdpReussi ? 
                                (
                                <div>
                                    <h2 style={{color: '#fff'}}>Mot de passe modifié avec succès✔️ !</h2>
                                    <button style={{width: '20%', height: '5vh', cursor: 'pointer', fontSize: 'large'}} onClick={fermerModalReussi}>Fermer</button>
                                </div>
                                ) :
                                (<Loader type="Circles" color="#fff" height={100} width={100}/>)
                            }
                        </div>
                    )
                }
            </Modal>
            <Modal
                isOpen={modalConfirmation}
                onRequestClose={fermerModalConfirmation}
                style={customStyles1}
                contentLabel=""
            >
                <form action="" className="form-compte">
                    <h3>Modifier mot de passe</h3>
                    <div className="box-input">
                        <p className="input-zone">
                            <label htmlFor="">Ancien mot de passe</label>
                            <input type="password" name="ancien" value={ancien} onChange={handleChange} autoComplete="off" />
                        </p>
                        <p className="input-zone">
                            <label htmlFor="">Nouveau mot de passe</label>
                            <input type="password" name="nouveau" value={nouveau} onChange={handleChange} autoComplete="off" />
                        </p>
                        <p className="input-zone">
                            <label htmlFor="">Confirmer nouveau mot de passe</label>
                            <input type="password" name="confirmation" value={confirmation} onChange={handleChange} autoComplete="off" />
                        </p>
                    </div>
                    <div style={{color: '#fff53b'}}>{msgErreur}</div>
                    <div className="btn-control">
                        <button type="reset" onClick={fermerModalConfirmation}>annuler</button>
                        <button type="submit" onClick={modifierMotDePasse}>valider</button>
                    </div>
                </form>
            </Modal>
            <div className="box-entete">
                <h3>{props.nomConnecte.toUpperCase()}</h3>
                <button onClick={() => {deconnection()}}>Déconnection</button>
            </div>
            {/* <button style={{width: '15%', position: 'absolute', left: '290px', bottom: 30,}} onClick={() => {setModalConfirmation(true)}} >Modifier mot de passe</button> */}
            <h1>
                © CMA de Bepanda
            </h1>
            <div style={{display: 'none'}}>
                <ImprimerRecette
                    ref={componentRef}
                    services={services}
                    recetteTotal={recetteTotal}
                />
            </div>
        </header>
    )
}
