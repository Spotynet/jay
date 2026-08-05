import { MotiPressableInteractionIds } from './context';
type Id = MotiPressableInteractionIds['id'];
type Deps = unknown[] | null | undefined;
type Returns<Factory> = {
    id: Id;
    factory: Factory;
    deps?: Deps;
};
type HookName = 'useMotiPressableAnimatedProps' | 'useMotiPressable' | 'useMotiPressableTransition';
export declare function useFactory<Factory extends (...props: any[]) => any>(hookName: HookName, factoryOrId: Factory | MotiPressableInteractionIds['id'], maybeFactoryOrDeps?: Factory | Deps, maybeDeps?: Deps): Returns<Factory>;
export {};
//# sourceMappingURL=use-validate-factory-or-id.d.ts.map