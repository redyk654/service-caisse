import React, { useEffect, useState, useContext, useRef } from 'react';
import './Historique.css';
import { ContextChargement } from '../../Context/Chargement';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

export default function Historique(props) {

    let date_select = useRef();

    const {chargement, stopChargement, startChargement} = useContext(ContextChargement);

    const [historique, sethistorique] = useState([])
    const [dateJour, setdateJour] = useState('');
    const [reccetteTotal, setRecetteTotal] = useState(false);
    const [dateRecherche, setdateRecherche] = useState('')

    useEffect(() => {
        startChargement();

        const d = new Date()
        let date;

        if (dateRecherche.length === 10) {
            date = dateRecherche;
        } else {
            date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
            setdateJour(d.toLocaleString().substr(0, 10));
        }

        const req = new XMLHttpRequest();
        req.open('GET', `http://localhost/backend-cma/recuperer_services_fait.php?date=${date}`);

        req.addEventListener('load', () => {
            const result = JSON.parse(req.responseText);
            sethistorique(result);
            stopChargement();
            const req2 = new XMLHttpRequest();
            req2.open('GET', `http://localhost/backend-cma/recuperer_services_fait.php?date=${date}&recette=oui`);
            req2.onload = () => {setRecetteTotal(JSON.parse(req2.responseText)[0].recette);}
            req2.send();

        });

        req.send();

    }, [dateRecherche]);

    const rechercherHistorique = () => {
        // Recherche d'un historique d'une date précise
        let date = date_select.current.value.split('-').reverse().join('/');  // Formatage de la date
        setdateJour(date);
        setdateRecherche(date_select.current.value);
    }

    return (
        <section className="historique">
            <h1>Historique des services médicaux</h1>
            <div className="container-historique">
                <div className="table-commandes">
                    <div className="entete-historique">
                        <input type="date" ref={date_select} />
                        <button onClick={rechercherHistorique}>rechercher</button>
                        <div>historique du : <span style={{fontWeight: '700'}}>{dateJour}</span></div>
                        <div>Recette total : <span style={{fontWeight: '700'}}>{reccetteTotal ? reccetteTotal + ' Fcfa' : '0 Fcfa'}</span></div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <td>Désignation</td>
                                <td>Prix</td>
                                <td>Par</td>
                                <td>Le</td>
                                <td>À</td>
                                <td>Patient</td>
                                <td>Reduction</td>
                            </tr>
                        </thead>
                        <tbody>
                            {historique.length > 0 && historique.map(item => (
                                <tr key={item.id}>
                                    <td>{item.designation}</td>
                                    <td>{item.prix}</td>
                                    <td>{item.caissier}</td>
                                    <td>{item.date_fait}</td>
                                    <td>{item.heure_fait}</td>
                                    <td>{item.patient}</td>
                                    <td style={{fontWeight: '700'}}>{item.reduction > 0 ? '-' + item.reduction + '%': null}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}
