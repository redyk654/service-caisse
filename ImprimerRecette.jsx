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
    
    render() {
        return (
            <div style={{fontSize: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '10px', backgroundColor: '#f1f1f1', height: '100vh'}}>
                <div style={{textAlign: 'center', width: '410px'}}>
                    <h2 style={{color: 'black', background: 'none', marginBottom: '12px'}}>CMA de Bepanda</h2>
                    <div style={{marginTop: 5}}>Fiche de recette du <span style={{fontWeight: '600', marginTop: '15px'}}>{this.props.infoRecette ? this.props.infoRecette[0].date_heure.substring(0, 11) : (new Date().toLocaleDateString() + ' ')} à {this.props.infoRecette ? this.props.infoRecette[0].date_heure.substring(11,) : (' ' + new Date().getHours() + 'h' + new Date().getMinutes() + 'min')}</span></div>
                    <div style={{textAlign: 'center', marginBottom: 20}}>
                        <table style={table_styles}>
                            <thead>
                                <th style={table_styles1}>Services</th>
                                <th style={table_styles2}>Recettes</th>
                            </thead>
                            <tbody>
                                {this.props.services ? this.props.services.map(item => (
                                    <tr>
                                        <td style={table_styles1}>{item.service}</td>
                                        <td style={table_styles2}>{item.recetteRestante}</td>
                                    </tr>
                                )) : this.props.detailsRecette.map(item => (
                                    <tr>
                                        <td style={table_styles1}>{item.categorie}</td>
                                        <td style={table_styles2}>{item.recette_restante}</td>
                                    </tr>
                                ))
                                }
                            </tbody>
                        </table>
                    </div>
                    <div style={{marginTop: 15}}>Recette totale : <strong>{this.props.infoRecette ? this.props.infoRecette[0].recette_restante + ' Fcfa' : this.props.recetteTotal + ' Fcfa'}</strong></div>
                </div>
            </div>
        )
    }
}
