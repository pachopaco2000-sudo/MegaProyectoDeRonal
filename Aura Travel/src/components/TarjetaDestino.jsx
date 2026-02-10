function TarjetaDestino({ destino }) {
    return (
        <div
            style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "16px",
                width: "250px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
        >
            <h3>{destino.nombre}</h3>
            <p>{destino.descripcion}</p>

            <button>Ver más</button>
        </div>
    );
}

export default TarjetaDestino;
