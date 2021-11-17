import React, { useRef, useState } from 'react';
import './Connexion.css';

export default function Connexion(props) {
    let name_field = useRef()
    let password_field = useRef()

    const [erreur, setErreur] = useState('')
    const [nom, setNom] = useState('');
    const [mdp, setMdp] = useState('');
    const [showMdp, setShowMdp] = useState(false);

    // Contrôle des zone de saisie avec le state
    const handleChange = (e) => {
        if(e.target.name === "nom") {
            setNom(e.target.value);
        } else if (e.target.name === "mdp"){
            setMdp(e.target.value);
        }
    }

    const verifConnexion = (e) => {
        /* vérification de l'identifiant et du mot de passe */

        e.preventDefault();

        const data = new FormData();
        data.append('nom', nom);
        data.append('mdp', mdp);

        const req = new XMLHttpRequest();
        req.open('POST', 'http://192.168.1.101/backend-cma/connexion_caisse.php');

        req.addEventListener('load', () => {
            if (req.status >= 200 && req.status < 400) {
                if (req.responseText == "identifiant ou mot de passe incorrect") {
                    setErreur(req.responseText);
                } else {
                    setErreur('')
                    const result = JSON.parse(req.responseText);
                    props.setRole(result.rol);
                    props.setNomConnecte(result.nom_user);
                    props.setConnecter(true);
                }
            } else {
                console.log(req.status + " " + req.statusText);
            }
        });

        req.send(data);
    }

    return (
        <div className='form'>
            <form action="">
                <h1 className='title'>CMA Bepanda</h1>
                <p className='text-field'>
                    <label htmlFor="nom" ref={name_field}>Identifiant</label>
                    <input
                    type="text"
                    name="nom"
                    id="nom"
                    value={nom}
                    autoComplete='off'
                    onChange={handleChange}
                    onFocus={() => {name_field.current.style.bottom = '20px'}}
                    onBlur={(e) => {if(e.target.value === '') name_field.current.style.bottom = '1px'}}
                    />
                </p>
                <p className='text-field'>
                    <label htmlFor="mdp" ref={password_field}>Mot de passe</label>
                    <input
                    type={`${showMdp ? 'text' : 'password'}`}
                    name="mdp"
                    id="mdp"
                    value={mdp}
                    onChange={handleChange}
                    onFocus={() => password_field.current.style.bottom = '20px'}
                    onBlur={(e) => {if(e.target.value === '') password_field.current.style.bottom = '1px'}}
                    />
                </p>
                <p style={{marginTop: 8}}>
                    <label htmlFor="" style={{color: '#fff'}}>Afficher mot de passe</label>
                    <input type="checkbox" checked={showMdp} id="" onChange={(e) => setShowMdp(!showMdp)} />
                </p>
                <button type='submit' onClick={verifConnexion} >Se connecter</button>
                <div className='message-erreur'>{erreur}</div>
            </form>
        </div>
    )
}
