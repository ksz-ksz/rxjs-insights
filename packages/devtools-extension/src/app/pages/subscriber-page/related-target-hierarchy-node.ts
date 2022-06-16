import { RelatedTarget } from '@app/protocols/insights';

export interface RelatedTargetHierarchyNode {
  key: string;
  type: 'root' | 'source' | 'destination';
  target: RelatedTarget;
  children: RelatedTargetHierarchyNode[];
}
