import React, { Component } from 'react';

const styles = {
    // display: 'flex',
    // justifyContent: 'center',
    fontWeight: '600',
    marginTop: '7px',
    width: '100%',
    // border: '1px solid #333',
}

const table_styles1 = {
    border: '1px solid #000',
    borderCollapse: 'collapse',
    padding: 10,
    textAlign: 'left'
}

const table_styles2 = {
    border: '1px solid #000',
    borderCollapse: 'collapse',
    padding: 10,
    textAlign: 'right'
}

const table_styles = {
    border: '1px solid #000',
    borderCollapse: 'collapse',
    padding: 10,
    width: '100%',
    marginTop: '15px',
    fontSize: 11
}

export default class Facture extends Component {
    
    mois = (str) => {

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

    render() {
        return (
            <div style={{fontSize: 11, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '10px', backgroundColor: '#f1f1f1', height: '100vh'}}>
                <div style={{textAlign: 'center', width: '410px'}}>
                    <h2 style={{color: 'black', background: 'none', marginBottom: '12px'}}>CMA de Bepanda</h2>
                    <h3 style={{color: 'black', background: 'none', marginBottom: '25px'}}>Caisse</h3>
                    <div style={{marginTop: 5}}>Facture N°<span style={{fontWeight: '600', marginTop: '15px'}}>{this.props.idFacture}</span></div>
                    <div style={{marginTop: 5}}>Caissier : <span style={{fontWeight: '600', marginTop: '15px',}}>{this.props.nomConnecte}</span></div>
                    <div style={{marginTop: '5px'}}>
                        Le <strong>{this.props.date ? this.mois(this.props.date.substring(0, 10)) : 
                        this.mois((new Date().toLocaleDateString()))}
                        </strong> à <strong>{this.props.date ? this.props.date.substring(11, 19) : 
                        (new Date().getHours() + 'h' + new Date().getMinutes() + 'min')}</strong>
                    </div>
                    <div style={{marginTop: 5}}>patient : <span style={{fontWeight: '600', marginTop: '15px'}}>{this.props.patient}</span></div>
                    <div style={{textAlign: 'center', marginBottom: 20}}>
                        <table style={table_styles}>
                            <thead>
                                <th style={table_styles1}>Désignation</th>
                                <th style={table_styles2}>Prix</th>
                            </thead>
                            <tbody>
                                {this.props.medocCommandes.map(item => (
                                    <tr>
                                        <td style={table_styles1}>{item.designation}</td>
                                        <td style={table_styles2}>{item.prix}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{marginTop: 15}}>Total : <strong>{this.props.prixTotal + ' Fcfa'}</strong></div>
                    <div style={{marginTop: 10}}>reduction : <strong>{this.props.reduction ? this.props.reduction + ' %' : 0 + '%'}</strong></div>
                    <div style={{marginTop: 10}}>Net à payer : <strong>{this.props.aPayer + ' Fcfa'}</strong></div>
                    <div style={{marginTop: 10}}>Montant versé : <strong>{this.props.montantVerse + ' Fcfa'}</strong></div>
                    <div style={{marginTop: 10}}>Relicat : <strong>{this.props.relicat ? this.props.relicat + ' Fcfa' : 0 + ' Fcfa'}</strong></div>
                    <div style={{marginTop: 10}}>Reste à payer : <strong>{this.props.resteaPayer + ' Fcfa'}</strong></div>
                    <div style={{fontStyle: 'italic', marginTop: '40px'}}> Bonne Guérison !!!</div>
                </div>
            </div>
        )
    }
}
