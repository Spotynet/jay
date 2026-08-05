export declare const styles: {
    panel_container: {
        position: "relative";
        borderRadius: number;
    };
    panel_image: {
        position: "absolute";
        top: number;
        left: number;
        width: "100%";
        height: "100%";
        overflow: "hidden";
    };
    selected: {
        aspectRatio: number;
        borderRadius: number;
        borderWidth: number;
        borderColor: string;
        right: number;
        position: "absolute";
    } | {
        aspectRatio: number;
        borderRadius: number;
        borderWidth: number;
        borderColor: string;
        left: number;
        position: "absolute";
    };
    handle: {
        top: number;
        justifyContent: "center";
        alignItems: "center";
        right: number;
        position: "absolute";
    } | {
        top: number;
        justifyContent: "center";
        alignItems: "center";
        left: number;
        position: "absolute";
    };
    shadow: {
        boxShadow: string;
        shadowColor?: undefined;
        shadowOffset?: undefined;
        shadowOpacity?: undefined;
        shadowRadius?: undefined;
        elevation?: undefined;
    } | {
        shadowColor: string;
        shadowOffset: {
            width: number;
            height: number;
        };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
        boxShadow?: undefined;
    };
    triangle: {
        width: number;
        height: number;
        backgroundColor: string;
        borderStyle: "solid";
        borderLeftColor: string;
        borderRightColor: string;
    };
    container: {
        flexDirection: "row";
        justifyContent: "center";
        alignItems: "center";
    };
    arrowButton: {
        width: number;
        height: number;
        marginLeft: number;
    };
    inputsWrapper: {
        flex: number;
        flexDirection: "row" | "row-reverse";
        gap: number;
    };
    inputsContainer: {
        flex: number;
    };
    input: {
        borderWidth: number;
        borderColor: string;
        borderRadius: number;
        paddingVertical: number;
        paddingHorizontal: number;
        textAlign: "center";
        fontSize: number;
        color: string;
    };
    inputTitle: {
        userSelect: "none";
        textAlign: "center";
        color: string;
        paddingVertical: number;
    } | {
        userSelect?: undefined;
        textAlign: "center";
        color: string;
        paddingVertical: number;
    };
    swatchesContainer: {
        flexDirection: "row";
        flexWrap: "wrap";
        justifyContent: "space-between";
    };
    swatch: {
        boxShadow: string;
        shadowColor?: undefined;
        shadowOffset?: undefined;
        shadowOpacity?: undefined;
        shadowRadius?: undefined;
        elevation?: undefined;
        width: number;
        height: number;
        borderRadius: number;
        marginHorizontal: number;
        marginBottom: number;
    } | {
        shadowColor: string;
        shadowOffset: {
            width: number;
            height: number;
        };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
        boxShadow?: undefined;
        width: number;
        height: number;
        borderRadius: number;
        marginHorizontal: number;
        marginBottom: number;
    };
    previewWrapper: {
        flexDirection: "row";
        height: number;
        borderRadius: number;
        overflow: "hidden";
    };
    previewContainer: {
        flex: number;
        justifyContent: "center";
    };
    previewText: {
        fontWeight: "bold";
        textAlign: "center";
        color: string;
        padding: number;
        pointerEvents: "none";
    };
    panel3Line: {
        boxShadow: string;
        shadowColor?: undefined;
        shadowOffset?: undefined;
        shadowOpacity?: undefined;
        shadowRadius?: undefined;
        elevation?: undefined;
        position: "absolute";
        backgroundColor: string;
    } | {
        shadowColor: string;
        shadowOffset: {
            width: number;
            height: number;
        };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
        boxShadow?: undefined;
        position: "absolute";
        backgroundColor: string;
    };
};
//# sourceMappingURL=styles.d.ts.map