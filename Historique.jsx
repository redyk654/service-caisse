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
    const [dateRecherche, setdateRecherche] = useState('');

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
        req.open('GET', `http://192.168.1.101/backend-cma/recuperer_services_fait.php?date=${date}`);

        req.addEventListener('load', () => {
            const result = JSON.parse(req.responseText);
            sethistorique(result);
            console.log(result);
            stopChargement();
            const req2 = new XMLHttpRequest();
            req2.open('GET', `http://192.168.1.101/backend-cma/recuperer_services_fait.php?date=${date}&recette=oui`);
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

    const mois = (str) => {

        switch(parseInt(str.substring(3, 5))) {
            case 1:
                return str.substring(0, 2) + " janvier " + str.substring(6, 10);
            case 2:
                return str.substring(0, 2) + " fevrier " + str.substring(6, 10);
            case 3:
                return str.substring(0, 2) + " mars " + str.substring(6, 10);
            case 4:
                return str.substring(0, 2) + " avril " +  str.substring(6, 10);
            case 5:
                return str.substring(0, 2) + " mai " + str.substring(6, 10);
            case 6:
                return str.substring(0, 2) + " juin " + str.substring(6, 10);
            case 7:
                return str.substring(0, 2) + " juillet " + str.substring(6, 10);
            case 8:
                return str.substring(0, 2) + " août " + str.substring(6, 10);
            case 9:
                return str.substring(0, 2) + " septembre " + str.substring(6, 10);
            case 10:
                return str.substring(0, 2) + " octobre " + str.substring(6, 10);
            case 11:
                return str.substring(0, 2) + " novembre " + str.substring(6, 10);
            case 12:
                return str.substring(0, 2) + " décembre " + str.substring(6, 10);
        }
    }

    const extraireCode = (designation) => {
        const codes = ['RX', 'LAB', 'MA', 'MED', 'CHR', 'CO', 'UPEC', 'SP', 'CA'];
        let designation_extrait = '';
        
        codes.forEach(item => {
            if(designation.toUpperCase().indexOf(item) === 0) {
                designation_extrait =  designation.slice(item.length + 1);
            } else if (designation.toUpperCase().indexOf('ECHO') === 0)  {
                designation_extrait = designation;
            }
        });

        if (designation_extrait === '') designation_extrait = designation;

        return designation_extrait;
    }

    return (
        <section className="historique">
            <h1>Historique des services médicaux</h1>
            <div className="container-historique">
                <div className="table-commandes">
                    <div className="entete-historique">
                        <input type="date" ref={date_select} />
                        <button onClick={rechercherHistorique}>rechercher</button>
                        <div>historique du : <span style={{fontWeight: '700'}}>{mois(dateJour)}</span></div>
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
                                    <td>{extraireCode(item.designation)}</td>
                                    <td>{item.prix}</td>
                                    <td>{item.caissier}</td>
                                    <td>{mois(item.date_fait)}</td>
                                    <td>{item.heure_fait}</td>
                                    <td>{item.patient}</td>
                                    <td style={{fontWeight: '700'}}>{parseInt(item.reduction) > 0 ? '-' + item.reduction + ' %': 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}
